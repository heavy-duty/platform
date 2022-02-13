import { online, repeatWithBackoff } from '@heavy-duty/rxjs';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  distinctUntilChanged,
  EMPTY,
  filter,
  fromEvent,
  interval,
  map,
  of,
  pairwise,
  switchMap,
  tap,
} from 'rxjs';

interface ViewModel {
  online: boolean;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  webSocket: WebSocket | null;
  error: unknown;
}

const initialState: ViewModel = {
  online: false,
  connected: false,
  connecting: false,
  disconnecting: false,
  webSocket: null,
  error: null,
};

export interface WebSocketConfig {
  endpoint: string;
  autoConnect: boolean;
  reconnection: boolean;
  reconnectionDelay: number;
  reconnectionAttempts: number;
  reconnectionDelayMax: number;
  heartBeatDelay: number;
  heartBeatMessage: string;
}

export class WebSocketStore<T> extends ComponentStore<ViewModel> {
  readonly webSocket$ = this.select(({ webSocket }) => webSocket);
  readonly connected$ = this.select(({ connected }) => connected);
  readonly connecting$ = this.select(({ connecting }) => connecting);
  readonly online$ = this.select(({ online }) => online);

  constructor(private readonly _config: WebSocketConfig) {
    super(initialState);

    if (this._config.autoConnect) {
      this.connect();
    }
  }

  readonly setWebSocket = this.updater((state, webSocket: WebSocket) => ({
    ...state,
    webSocket,
  }));

  readonly loadOnline = this.effect(() =>
    online().pipe(
      distinctUntilChanged(),
      tapResponse(
        (online) => this.patchState({ online }),
        (error) => this.patchState({ error })
      )
    )
  );

  readonly disconnectOnOffline = this.effect(() =>
    this.select(
      this.online$,
      this.connected$,
      this.webSocket$,
      (online, connected, webSocket) => ({ online, connected, webSocket }),
      { debounce: true }
    ).pipe(
      tap(({ online, connected, webSocket }) => {
        if (webSocket !== null && connected && !online) {
          this.disconnect();
        }
      })
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
                error: null,
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
                webSocket: null,
                error: null,
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
      this.connecting$,
      (connected, connecting) => ({
        connected,
        connecting,
      }),
      { debounce: true }
    ).pipe(
      switchMap(({ connected, connecting }) => {
        if (connected || connecting || !this._config.reconnection) {
          return EMPTY;
        }

        return of(null).pipe(
          repeatWithBackoff({
            delay: this._config.reconnectionDelay,
            attempts: this._config.reconnectionAttempts,
            delayMax: this._config.reconnectionDelayMax,
          }),
          tapResponse(
            () => this.connect(),
            (error) => this.patchState({ error })
          )
        );
      })
    )
  );

  readonly heartBeat = this.effect(() =>
    this.select(
      this.webSocket$,
      this.connected$,
      (webSocket, connected) => ({
        webSocket,
        connected,
      }),
      { debounce: true }
    ).pipe(
      switchMap(({ webSocket, connected }) => {
        if (webSocket === null || !connected) {
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

  connect() {
    this.setWebSocket(new WebSocket(this._config.endpoint));
  }

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
