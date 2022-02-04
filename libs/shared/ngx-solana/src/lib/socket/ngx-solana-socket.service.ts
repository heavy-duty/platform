import { Inject, Injectable } from '@angular/core';
import { AccountInfo, Commitment } from '@solana/web3.js';
import { BehaviorSubject, first, map, Observable, switchMap } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { NgxSolanaConfig, NGX_SOLANA_CONFIG } from '../ngx-solana.config';
import { PING_DELAY_MS } from './constants';
import { onAccountChange } from './on-account-change';
import { onSignatureChange } from './on-signature-change';
import { RpcMessage } from './types';

@Injectable()
export class NgxSolanaSocketService {
  private readonly _connected = new BehaviorSubject(false);
  readonly connected$ = this._connected.asObservable();
  private readonly _webSocketSubject = new BehaviorSubject(
    this._createWebSocket()
  );
  private readonly _webSocketSubject$ = this._webSocketSubject.asObservable();

  constructor(
    @Inject(NGX_SOLANA_CONFIG)
    private readonly _solanaRpcConfig: NgxSolanaConfig
  ) {}

  private _createWebSocket() {
    let interval: NodeJS.Timer;

    const webSocketSubject = webSocket<RpcMessage>({
      url: this._solanaRpcConfig.websocketEndpoint,
      openObserver: {
        next: () => {
          interval = setInterval(
            () =>
              webSocketSubject.next({
                jsonrpc: '2.0',
                method: 'ping',
                params: null,
              }),
            PING_DELAY_MS
          );
          this._connected.next(true);
        },
      },
      closeObserver: {
        next: (event) => {
          clearInterval(interval);
          this._connected.next(false);
          if (!event.wasClean) {
            this.connect();
          }
        },
      },
    });

    return webSocketSubject;
  }

  connect() {
    this._webSocketSubject.next(this._createWebSocket());
  }

  disconnect() {
    this._webSocketSubject$
      .pipe(first())
      .subscribe((webSocketSubject) => webSocketSubject.complete());
  }

  onAccountChange(
    accountId: string,
    commitment: Commitment = 'confirmed'
  ): Observable<AccountInfo<Buffer>> {
    return this._webSocketSubject$.pipe(
      switchMap((webSocketSubject) =>
        onAccountChange(webSocketSubject, accountId, commitment)
      ),
      map((message) => message.params.result.value)
    );
  }

  onSignatureChange(
    signature: string,
    commitment: Commitment = 'confirmed'
  ): Observable<{ err: unknown }> {
    return this._webSocketSubject$.pipe(
      switchMap((webSocketSubject) =>
        onSignatureChange(webSocketSubject, signature, commitment)
      ),
      map((message) => message.params.result.value)
    );
  }
}
