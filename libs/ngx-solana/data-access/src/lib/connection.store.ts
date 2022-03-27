import { Inject, Injectable } from '@angular/core';
import { WebSocketStore } from '@heavy-duty/ngx-websocket';
import {
  RpcAccountParamsNotification,
  RpcMessage,
  RpcNotification,
  RpcProgramAccountParamsNotification,
  RpcSignatureParamsNotification,
} from '@heavy-duty/rx-solana';
import { shareWhileSubscribed } from '@heavy-duty/rxjs';
import {
  AccountInfo,
  Commitment,
  GetProgramAccountsConfig,
} from '@solana/web3.js';
import { filter, map, Observable } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { HdSolanaConfig, HD_SOLANA_CONFIG } from './config';
import { HdSolanaConfigStore } from './config.store';
import {
  hashGetProgramAccountsRequest,
  hashSignatureListener,
} from './internal';

@Injectable()
export class HdSolanaConnectionStore extends WebSocketStore<RpcMessage> {
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
    @Inject(HD_SOLANA_CONFIG)
    hdSolanaConfig: HdSolanaConfig,
    hdSolanaConfigStore: HdSolanaConfigStore
  ) {
    super(hdSolanaConfig.webSocketConfig);

    this.setEndpoint(hdSolanaConfigStore.webSocketEndpoint$);
  }

  onAccountChange(
    accountId: string,
    commitment: Commitment = 'confirmed'
  ): Observable<AccountInfo<Buffer>> {
    const cachedOnAccountChange = this._accountChanges.get(accountId);

    if (cachedOnAccountChange !== undefined) {
      return cachedOnAccountChange;
    }

    const correlationId = uuid();
    let subscriptionId: number;

    const onAccountChange$ = this.multiplex(
      () => ({
        jsonrpc: '2.0',
        id: correlationId,
        method: 'accountSubscribe',
        params: [
          accountId,
          {
            encoding: 'base64',
            commitment,
          },
        ],
      }),
      () => ({
        jsonrpc: '2.0',
        id: uuid(),
        method: 'accountUnsubscribe',
        params: [subscriptionId],
      }),
      (message: RpcMessage) => {
        if ('id' in message && message.id === correlationId) {
          subscriptionId = message.result;
        }

        return (
          'method' in message &&
          message.method === 'accountNotification' &&
          message.params !== null &&
          message.params.subscription === subscriptionId
        );
      }
    ).pipe(
      filter(
        (message): message is RpcNotification<RpcAccountParamsNotification> =>
          'method' in message
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

    const correlationId = uuid();
    let subscriptionId: number;

    const onProgramAccountChange$ = this.multiplex(
      () => ({
        jsonrpc: '2.0',
        id: correlationId,
        method: 'programSubscribe',
        params: [
          programId,
          {
            encoding: config?.encoding ?? 'base64',
            commitment: config?.commitment ?? 'confirmed',
            filters: config?.filters ?? [],
            dataSlice: config?.dataSlice,
          },
        ],
      }),
      () => ({
        jsonrpc: '2.0',
        id: uuid(),
        method: 'programUnsubscribe',
        params: [subscriptionId],
      }),
      (message: RpcMessage) => {
        if ('id' in message && message.id === correlationId) {
          subscriptionId = message.result;
        }

        return (
          'method' in message &&
          message.method === 'programNotification' &&
          message.params !== null &&
          message.params.subscription === subscriptionId
        );
      }
    ).pipe(
      filter(
        (
          message
        ): message is RpcNotification<RpcProgramAccountParamsNotification> =>
          'method' in message
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

    this._programAccountChanges.set(hashKey, onProgramAccountChange$);

    return onProgramAccountChange$;
  }

  onSignatureChange(
    signature: string,
    commitment: Commitment = 'confirmed'
  ): Observable<{ err: unknown }> {
    const cachedOnSignatureChange = this._signatureChanges.get(
      hashSignatureListener(signature, commitment)
    );

    if (cachedOnSignatureChange !== undefined) {
      return cachedOnSignatureChange;
    }

    const correlationId = uuid();
    let subscriptionId: number;

    const onSignatureChange$ = this.multiplex(
      () => ({
        jsonrpc: '2.0',
        id: correlationId,
        method: 'signatureSubscribe',
        params: [
          signature,
          {
            commitment,
          },
        ],
      }),
      () => ({
        jsonrpc: '2.0',
        id: uuid(),
        method: 'signatureUnsubscribe',
        params: [subscriptionId],
      }),
      (message: RpcMessage) => {
        if ('id' in message && message.id === correlationId) {
          subscriptionId = message.result;
        }

        return (
          'method' in message &&
          message.method === 'signatureNotification' &&
          message.params !== null &&
          message.params.subscription === subscriptionId
        );
      }
    ).pipe(
      filter(
        (message): message is RpcNotification<RpcSignatureParamsNotification> =>
          'method' in message
      ),
      map((message) => message.params.result.value),
      shareWhileSubscribed(() => this._signatureChanges.delete(signature))
    );

    this._signatureChanges.set(signature, onSignatureChange$);

    return onSignatureChange$;
  }
}
