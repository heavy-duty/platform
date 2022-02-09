import { Commitment } from '@solana/web3.js';
import { filter, Observable } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';
import { v4 as uuid } from 'uuid';
import {
  RpcMessage,
  RpcNotification,
  RpcSignatureParamsNotification,
} from './types';

export const onSignatureChange = (
  webSocketSubject: WebSocketSubject<RpcMessage>,
  signature: string,
  commitment: Commitment = 'confirmed'
): Observable<RpcNotification<RpcSignatureParamsNotification>> => {
  const correlationId = uuid();
  let subscriptionId: number;

  return webSocketSubject
    .multiplex(
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
    )
    .pipe(
      filter(
        (message): message is RpcNotification<RpcSignatureParamsNotification> =>
          'method' in message
      )
    );
};
