import { Inject, Injectable } from '@angular/core';
import {
  onAccountChange,
  onProgramAccountChange,
  onSignatureChange,
  RpcMessage,
} from '@heavy-duty/rx-solana';
import { shareWhileSubscribed } from '@heavy-duty/rxjs-operators';
import {
  AccountInfo,
  Commitment,
  DataSizeFilter,
  GetProgramAccountsConfig,
  GetProgramAccountsFilter,
  MemcmpFilter,
} from '@solana/web3.js';
import { BehaviorSubject, first, map, Observable, switchMap } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { NgxSolanaConfig, NGX_SOLANA_CONFIG } from './config';

const PING_DELAY_MS = 30_000;

const hashGetProgramAccountsRequest = (
  programId: string,
  filters: GetProgramAccountsFilter[] = []
) => {
  const dataSizeFilters = filters
    .filter((filter): filter is DataSizeFilter => 'dataSize' in filter)
    .sort((a, b) => a.dataSize - b.dataSize)
    .map((filter) => `dataSize:${filter.dataSize}`);
  const memcmpFilters = filters
    .filter((filter): filter is MemcmpFilter => 'memcmp' in filter)
    .sort((a, b) => {
      if (a.memcmp.bytes < b.memcmp.bytes) {
        return -1;
      } else if (a.memcmp.bytes > b.memcmp.bytes) {
        return 1;
      } else {
        return 0;
      }
    })
    .sort((a, b) => a.memcmp.offset - b.memcmp.offset)
    .map((filter) => `memcmp:${filter.memcmp.offset}:${filter.memcmp.bytes}`);
  return [...dataSizeFilters, ...memcmpFilters].reduce(
    (hash, filter) => `${hash}+${filter}`,
    `programId:${programId}`
  );
};

@Injectable()
export class NgxSolanaSocketService {
  private readonly _connected = new BehaviorSubject(false);
  readonly connected$ = this._connected.asObservable();
  private readonly _webSocketSubject = new BehaviorSubject(
    this._createWebSocket()
  );
  private readonly _webSocketSubject$ = this._webSocketSubject.asObservable();
  private readonly _accountChanges = new Map<
    string,
    Observable<AccountInfo<Buffer>>
  >();
  private readonly _programAccountChanges = new Map<
    string,
    Observable<{
      pubkey: string;
      account: AccountInfo<Buffer>;
    }>
  >();
  private readonly _signatureChanges = new Map<
    string,
    Observable<{
      err: unknown;
    }>
  >();

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
    const cachedOnAccountChange = this._accountChanges.get(accountId);

    if (cachedOnAccountChange !== undefined) {
      return cachedOnAccountChange;
    }

    const onAccountChange$ = this._webSocketSubject$.pipe(
      switchMap((webSocketSubject) =>
        onAccountChange(webSocketSubject, accountId, commitment)
      ),
      map((message) => ({
        ...message.params.result.value,
        data: Buffer.from(message.params.result.value.data[0], 'base64'),
      })),
      shareWhileSubscribed(() => this._accountChanges.delete(accountId))
    );

    this._accountChanges.set(accountId, onAccountChange$);

    return onAccountChange$;
  }

  onProgramAccountChange(
    programId: string,
    config?: GetProgramAccountsConfig
  ): Observable<{ pubkey: string; account: AccountInfo<Buffer> }> {
    const hashKey = hashGetProgramAccountsRequest(programId, config?.filters);
    const cachedOnProgramAccountChange =
      this._programAccountChanges.get(hashKey);

    if (cachedOnProgramAccountChange !== undefined) {
      return cachedOnProgramAccountChange;
    }

    const onProgramAccountChange$ = this._webSocketSubject$.pipe(
      switchMap((webSocketSubject) =>
        onProgramAccountChange(webSocketSubject, programId, config)
      ),
      map((message) => ({
        pubkey: message.params.result.value.pubkey,
        account: {
          ...message.params.result.value.account,
          data: Buffer.from(
            message.params.result.value.account.data[0],
            'base64'
          ),
        },
      })),
      shareWhileSubscribed(() => this._programAccountChanges.delete(hashKey))
    );

    return onProgramAccountChange$;
  }

  onSignatureChange(
    signature: string,
    commitment: Commitment = 'confirmed'
  ): Observable<{ err: unknown }> {
    const cachedOnSignatureChange = this._signatureChanges.get(signature);

    if (cachedOnSignatureChange !== undefined) {
      return cachedOnSignatureChange;
    }

    const onSignatureChange$ = this._webSocketSubject$.pipe(
      switchMap((webSocketSubject) =>
        onSignatureChange(webSocketSubject, signature, commitment)
      ),
      map((message) => message.params.result.value),
      shareWhileSubscribed(() => this._signatureChanges.delete(signature))
    );

    return onSignatureChange$;
  }
}
