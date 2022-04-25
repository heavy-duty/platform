import { Injectable } from '@nestjs/common';
import {
  BehaviorSubject,
  filter,
  mapTo,
  merge,
  scan,
  share,
  tap,
  withLatestFrom,
} from 'rxjs';
import { initialState, reduce } from './state';
import type {
  ActionTypes,
  ClientSubscribed,
  State,
  TransactionConfirmed,
  TransactionFailed,
  TransactionFinalized,
  TransactionReceived,
} from './types';

@Injectable()
export class EventsService {
  private readonly _dispatch = new BehaviorSubject<ActionTypes | null>(null);
  readonly actions$ = this._dispatch.asObservable();
  readonly state$ = this.actions$.pipe(
    scan((state, action) => {
      if (action === null) {
        return state;
      }

      return reduce(state, action);
    }, initialState),
    share()
  );

  // When client subscribes send all the transactions in process
  private readonly _clientSubscribed$ = this.actions$.pipe(
    filter(
      (action): action is ClientSubscribed =>
        action !== null && action.type === 'CLIENT_SUBSCRIBED'
    ),
    withLatestFrom(this.state$),
    tap(([action, state]: [ClientSubscribed, State]) => {
      const { client, topicName, subscriptionId, correlationId } =
        action.payload;
      const topic = state.topics.get(topicName);

      client.send(
        JSON.stringify({
          event: 'message',
          data: {
            id: correlationId,
            subscriptionId,
          },
        })
      );

      if (topic !== undefined) {
        topic.transactions.forEach((transactionStatus) => {
          client.send(
            JSON.stringify({
              event: 'message',
              data: {
                topicName,
                transactionStatus,
                subscriptionId,
              },
            })
          );
        });
      }
    }),
    mapTo<null>(null)
  );

  // Whenever a transaction changes broadcast to respective topics
  private readonly _handleTransaction$ = this.actions$.pipe(
    filter(
      (action): action is TransactionReceived =>
        action !== null &&
        (action.type === 'TRANSACTION_RECEIVED' ||
          action.type === 'TRANSACTION_CONFIRMED' ||
          action.type === 'TRANSACTION_FINALIZED' ||
          action.type === 'TRANSACTION_FAILED')
    ),
    withLatestFrom(this.state$),
    tap(
      ([action, state]: [
        (
          | TransactionReceived
          | TransactionConfirmed
          | TransactionFinalized
          | TransactionFailed
        ),
        State
      ]) => {
        const { transactionStatus, topicNames } = action.payload;

        topicNames.forEach((topicName) => {
          const topic = state.topics.get(topicName);

          if (topic !== undefined) {
            topic.clients.forEach(({ client, subscriptions }) => {
              subscriptions.forEach((subscriptionId) => {
                client.send(
                  JSON.stringify({
                    event: 'message',
                    data: {
                      topicName,
                      transactionStatus,
                      subscriptionId,
                    },
                  })
                );
              });
            });
          }
        });
      }
    ),
    mapTo<null>(null)
  );

  constructor() {
    merge(this._clientSubscribed$, this._handleTransaction$).subscribe(
      this._dispatch
    );

    this.state$.subscribe();
  }

  dispatch(action: ActionTypes) {
    this._dispatch.next(action);
  }
}
