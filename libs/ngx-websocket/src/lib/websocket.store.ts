import { online, repeatWithBackoff } from '@heavy-duty/rxjs';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  distinctUntilChanged,
  EMPTY,
  filter,
  fromEvent,
  interval,
  map,
  of,
  pairwise,
  Subject,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';

export type Network = 'localhost' | 'devnet' | 'testnet' | 'mainnet-beta';

type WebSocketProtocol = 'ws' | 'wss';

type Url = string;
export type WebSocketEndpoint = `${WebSocketProtocol}://${Url}`;

interface ViewModel {
  online: boolean;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  webSocket: WebSocket | null;
  error: unknown;
  connectedAt: number | null;
  disconnectedAt: number | null;
  onlineSince: number | null;
  offlineSince: number | null;
  nextAttemptAt: number | null;
  lastAttemptAt: number | null;
  endpoint: WebSocketEndpoint | null;
}

const initialState: ViewModel = {
  online: false,
  connected: false,
  connecting: false,
  disconnecting: false,
  webSocket: null,
  error: null,
  onlineSince: null,
  offlineSince: null,
  connectedAt: null,
  disconnectedAt: null,
  nextAttemptAt: null,
  lastAttemptAt: null,
  endpoint: null,
};

export interface WebSocketConfig {
  reconnection: boolean;
  reconnectionDelay: number;
  reconnectionAttempts?: number;
  reconnectionDelayMax: number;
  heartBeatDelay: number;
  heartBeatMessage: string;
}

export class WebSocketStore<T> extends ComponentStore<ViewModel> {
  private readonly _reconnect = new Subject();
  private readonly _endpoint$ = this.select(({ endpoint }) => endpoint);
  readonly webSocket$ = this.select(({ webSocket }) => webSocket);
  readonly connected$ = this.select(({ connected }) => connected);
  readonly connecting$ = this.select(({ connecting }) => connecting);
  readonly online$ = this.select(({ online }) => online);
  readonly nextAttemptAt$ = this.select(({ nextAttemptAt }) => nextAttemptAt);
  readonly disconnectedAt$ = this.select(
    ({ disconnectedAt }) => disconnectedAt
  );
  readonly connectedAt$ = this.select(({ connectedAt }) => connectedAt);
  readonly onlineSince$ = this.select(({ onlineSince }) => onlineSince);
  readonly offlineSince$ = this.select(({ offlineSince }) => offlineSince);

  constructor(private readonly _config: WebSocketConfig) {
    super(initialState);
  }

  readonly setWebSocket = this.updater((state, webSocket: WebSocket) => ({
    ...state,
    webSocket,
    connecting: true,
    lastAttemptAt: Date.now(),
  }));

  readonly setEndpoint = this.updater(
    (state, endpoint: WebSocketEndpoint | null) => ({
      ...state,
      endpoint,
    })
  );

  readonly loadOnline = this.effect(() =>
    online().pipe(
      distinctUntilChanged(),
      tapResponse(
        (online) => {
          if (online) {
            this.patchState({
              online,
              onlineSince: Date.now(),
              offlineSince: null,
            });
          } else {
            this.patchState({
              online,
              onlineSince: null,
              offlineSince: Date.now(),
            });
          }
        },
        (error) => this.patchState({ error })
      )
    )
  );

  readonly disconnectPreviousWebSocket = this.effect(() =>
    this.webSocket$.pipe(
      pairwise(),
      tap(([webSocket]) => {
        if (webSocket !== null && webSocket.readyState === webSocket.OPEN) {
          try {
            webSocket.close();
          } catch (error) {
            this.patchState({ error });
          }
        }
      })
    )
  );

  readonly handleEndpointChange = this.effect(() =>
    this._endpoint$
      .pipe(
        concatMap((endpoint) =>
          of(endpoint).pipe(
            withLatestFrom(this.webSocket$, this.connected$, this.connecting$)
          )
        )
      )
      .pipe(
        tap(([endpoint, webSocket, connected, connecting]) => {
          if (
            endpoint !== null &&
            webSocket !== null &&
            endpoint !== webSocket.url &&
            connected &&
            !connecting
          ) {
            this.disconnect();
          }
        })
      )
  );

  readonly handleOpen = this.effect(() =>
    this.webSocket$.pipe(
      switchMap((webSocket) => {
        if (webSocket === null) {
          return EMPTY;
        }

        return fromEvent(webSocket, 'open').pipe(
          tapResponse(
            () =>
              this.patchState({
                connected: true,
                connecting: false,
                connectedAt: Date.now(),
              }),
            (error) => this.patchState({ error })
          )
        );
      })
    )
  );

  readonly handleClose = this.effect(() =>
    this.webSocket$.pipe(
      switchMap((webSocket) => {
        if (webSocket === null) {
          return EMPTY;
        }

        return fromEvent(webSocket, 'close').pipe(
          tapResponse(
            () =>
              this.patchState({
                connected: false,
                disconnecting: false,
                disconnectedAt: Date.now(),
              }),
            (error) => this.patchState({ error })
          )
        );
      })
    )
  );

  readonly handleError = this.effect(() =>
    this.webSocket$.pipe(
      switchMap((webSocket) => {
        if (webSocket === null) {
          return EMPTY;
        }

        return fromEvent(webSocket, 'error').pipe(
          tapResponse(
            (error) =>
              this.patchState({
                error,
                connecting: false,
              }),
            (error) => this.patchState({ error })
          )
        );
      })
    )
  );

  readonly handleReconnect = this.effect(() =>
    this.select(
      this.connected$,
      this.online$,
      this._endpoint$,
      (connected, online, endpoint) => ({
        connected,
        online,
        endpoint,
      })
    ).pipe(
      switchMap(({ connected, online, endpoint }) => {
        if (
          !online ||
          connected ||
          endpoint === null ||
          !this._config.reconnection
        ) {
          return EMPTY;
        }

        return of(null).pipe(
          repeatWithBackoff({
            delay: this._config.reconnectionDelay,
            attempts: this._config.reconnectionAttempts,
            delayMax: this._config.reconnectionDelayMax,
            attemptCallback: ({ nextAttemptAt }) =>
              this.patchState({
                nextAttemptAt,
              }),
            restart$: this._reconnect.asObservable(),
          }),
          tapResponse(
            () => this.connect(endpoint),
            (error) => this.patchState({ error })
          )
        );
      })
    )
  );

  readonly heartBeat = this.effect(() =>
    this.select(
      this.webSocket$,
      this.online$,
      this.connected$,
      (webSocket, online, connected) => ({
        webSocket,
        online,
        connected,
      }),
      { debounce: true }
    ).pipe(
      switchMap(({ webSocket, online, connected }) => {
        if (!online || !connected || webSocket === null) {
          return EMPTY;
        }

        return interval(this._config.heartBeatDelay).pipe(
          tap(() => {
            try {
              webSocket.send(this._config.heartBeatMessage);
            } catch (error) {
              this.patchState({
                error,
              });
            }
          })
        );
      })
    )
  );

  readonly handleConnectionLost = this.effect(() =>
    this.online$.pipe(
      filter((online) => !online),
      tap(() => {
        this.patchState({ offlineSince: Date.now() });
        this.disconnect();
      })
    )
  );

  connect = this.effect<WebSocketEndpoint>(
    tap((endpoint) => {
      if (!endpoint) {
        throw Error('Endpoint missing');
      }

      const webSocket = new WebSocket(endpoint);
      this.setWebSocket(webSocket);
    })
  );

  disconnect() {
    const { webSocket } = this.get();

    if (webSocket) {
      this.patchState({ disconnecting: true });
      try {
        webSocket.close();
      } catch (error) {
        this.patchState({ error });
      }
    }
  }

  send(message: string) {
    const { webSocket } = this.get();

    if (webSocket) {
      webSocket.send(message);
    }
  }

  fromEvent(event: string) {
    return this.select(
      this.webSocket$,
      this.connected$,
      (webSocket, connected) => ({
        webSocket,
        connected,
      }),
      { debounce: true }
    ).pipe(
      switchMap(({ connected, webSocket }) => {
        if (!connected || webSocket === null) {
          return EMPTY;
        }

        return fromEvent<MessageEvent<string>>(webSocket, 'message').pipe(
          map((message) => JSON.parse(message.data)),
          filter((message) => message.event === event)
        );
      })
    );
  }

  reconnect() {
    this._reconnect.next(null);
  }

  multiplex(
    subMsg: () => unknown,
    unsubMsg: () => unknown,
    messageFilter: (value: T) => boolean
  ) {
    return this.select(
      this.webSocket$,
      this.connected$,
      (webSocket, connected) => ({
        webSocket,
        connected,
      }),
      { debounce: true }
    ).pipe(
      switchMap(({ connected, webSocket }) => {
        if (!connected || webSocket === null) {
          return EMPTY;
        }

        return fromEvent<MessageEvent<string>>(webSocket, 'message').pipe(
          tap({
            subscribe: () => {
              try {
                webSocket.send(JSON.stringify(subMsg()));
              } catch (error) {
                this.patchState({ error });
              }
            },
            unsubscribe: () => {
              if (webSocket.readyState === webSocket.OPEN) {
                try {
                  webSocket.send(JSON.stringify(unsubMsg()));
                } catch (error) {
                  this.patchState({ error });
                }
              }
            },
          }),
          map((message) => JSON.parse(message.data)),
          filter((message) => messageFilter(message))
        );
      })
    );
  }
}
