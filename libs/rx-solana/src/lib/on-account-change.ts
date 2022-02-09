import { Commitment } from '@solana/web3.js';
import { filter, Observable } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';
import { v4 as uuid } from 'uuid';
import {
  RpcAccountParamsNotification,
  RpcMessage,
  RpcNotification,
} from './types';

export const onAccountChange = (
  webSocketSubject: WebSocketSubject<RpcMessage>,
  accountId: string,
  commitment: Commitment = 'confirmed'
): Observable<RpcNotification<RpcAccountParamsNotification>> => {
  const correlationId = uuid();
  let subscriptionId: number;

  return webSocketSubject
    .multiplex(
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
    )
    .pipe(
      filter(
        (message): message is RpcNotification<RpcAccountParamsNotification> =>
          'method' in message
      )
    );
};
