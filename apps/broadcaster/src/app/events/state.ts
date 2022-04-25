import { Map, Set } from 'immutable';
import { ActionTypes, State } from './types';

export const initialState: State = {
  topics: Map(),
  clients: Map(),
};

export const reduce = (state: State, action: ActionTypes): State => {
  switch (action.type) {
    case 'CLIENT_CONNECTED':
      return {
        ...state,
        clients: state.clients.set(action.payload, {
          client: action.payload,
          subscriptions: Map(),
        }),
      };
    case 'CLIENT_DISCONNECTED': {
      const broadcasterClient = state.clients.get(action.payload);

      if (broadcasterClient === undefined) {
        return state;
      }

      return {
        ...state,
        clients: state.clients.remove(action.payload),
        topics: broadcasterClient.subscriptions
          .reduce(
            (topics, topicSubscription) =>
              topics.update(
                topicSubscription.topicName,
                undefined,
                (topic) => ({
                  ...topic,
                  clients: topic.clients.delete(broadcasterClient.client),
                })
              ),
            state.topics
          )
          .filter(
            (topic) => topic.clients.size > 0 || topic.transactions.size > 0
          ),
      };
    }
    case 'CLIENT_SUBSCRIBED': {
      const { client, subscriptionId, topicName } = action.payload;

      return {
        ...state,
        clients: state.clients.update(
          client,
          {
            client,
            subscriptions: Map([
              [subscriptionId, { topicName, subscriptionId }],
            ]),
          },
          (broadcasterClient) => ({
            ...broadcasterClient,
            subscriptions: broadcasterClient.subscriptions.set(subscriptionId, {
              subscriptionId,
              topicName,
            }),
          })
        ),
        topics: state.topics.update(
          topicName,
          {
            topicName,
            transactions: Map(),
            clients: Map([
              [client, { client, subscriptions: Set([subscriptionId]) }],
            ]),
          },
          (topic) => ({
            ...topic,
            clients: topic.clients.update(
              client,
              { client, subscriptions: Set([subscriptionId]) },
              (client) => ({
                ...client,
                subscriptions: client.subscriptions.add(subscriptionId),
              })
            ),
          })
        ),
      };
    }
    case 'CLIENT_UNSUBSCRIBED': {
      const { topicName, client, subscriptionId } = action.payload;

      return {
        ...state,
        topics: state.topics.update(topicName, undefined, (topic) => ({
          ...topic,
          clients: topic.clients
            .update(client, undefined, (topicClient) => ({
              ...topicClient,
              subscriptions: topicClient.subscriptions.delete(subscriptionId),
            }))
            .filter((topicClient) => topicClient.subscriptions.size > 0),
        })),
        clients: state.clients.update(
          client,
          undefined,
          (broadcasterClient) => ({
            ...broadcasterClient,
            subscriptions:
              broadcasterClient.subscriptions.delete(subscriptionId),
          })
        ),
      };
    }
    case 'TRANSACTION_RECEIVED': {
      const { topicNames, transactionStatus } = action.payload;

      return {
        ...state,
        topics: topicNames.reduce(
          (topics, topicName) =>
            topics.update(
              topicName,
              {
                topicName,
                clients: Map(),
                transactions: Map([
                  [transactionStatus.signature, transactionStatus],
                ]),
              },
              (topic) => ({
                ...topic,
                transactions: topic.transactions.set(
                  transactionStatus.signature,
                  transactionStatus
                ),
              })
            ),

          state.topics
        ),
      };
    }
    case 'TRANSACTION_CONFIRMED': {
      const { topicNames, transactionStatus } = action.payload;

      return {
        ...state,
        topics: topicNames.reduce(
          (topics, topicName) =>
            topics.update(topicName, undefined, (topic) => ({
              ...topic,
              transactions: topic.transactions.update(
                transactionStatus.signature,
                undefined,
                (transaction) => ({
                  ...transaction,
                  ...transactionStatus,
                })
              ),
            })),
          state.topics
        ),
      };
    }
    case 'TRANSACTION_FINALIZED':
    case 'TRANSACTION_FAILED': {
      const { topicNames, transactionStatus } = action.payload;

      return {
        ...state,
        topics: topicNames
          .reduce(
            (topics, topicName) =>
              topics.update(topicName, undefined, (topic) => ({
                ...topic,
                transactions: topic.transactions.delete(
                  transactionStatus.signature
                ),
              })),
            state.topics
          )
          .filter(
            (topic) => topic.clients.size > 0 || topic.transactions.size > 0
          ),
      };
    }

    default:
      return state;
  }
};
