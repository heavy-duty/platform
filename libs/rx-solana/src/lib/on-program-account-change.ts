import { GetProgramAccountsConfig } from '@solana/web3.js';
import { filter, Observable } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';
import { v4 as uuid } from 'uuid';
import {
  RpcMessage,
  RpcNotification,
  RpcProgramAccountParamsNotification,
} from './types';

export const onProgramAccountChange = (
  webSocketSubject: WebSocketSubject<RpcMessage>,
  programId: string,
  config?: GetProgramAccountsConfig
): Observable<RpcNotification<RpcProgramAccountParamsNotification>> => {
  const correlationId = uuid();
  let subscriptionId: number;

  return webSocketSubject
    .multiplex(
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
    )
    .pipe(
      filter(
        (
          message
        ): message is RpcNotification<RpcProgramAccountParamsNotification> =>
          'method' in message
      )
    );
};
