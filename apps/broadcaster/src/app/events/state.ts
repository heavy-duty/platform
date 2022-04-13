import { Map, Set } from 'immutable';
import WebSocket from 'ws';
import { ActionTypes, State, TopicState, TransactionStatus } from './types';

export const initialState: State = {
  topics: Map<string, TopicState>(),
  clients: Set<WebSocket>(),
};

export const reduce = (state: State, action: ActionTypes): State => {
  switch (action.type) {
    case 'CLIENT_CONNECTED':
      return {
        ...state,
        clients: state.clients.add(action.payload),
      };
    case 'CLIENT_DISCONNECTED': {
      return {
        ...state,
        clients: state.clients.remove(action.payload),
        topics: state.topics.reduce((topics, topic, topicName) => {
          const clients = topic.clients.delete(action.payload);

          if (clients.size === 0 && topic.transactions.size === 0) {
            return topics.delete(topicName);
          }

          if (clients.size > 0) {
            return topics.set(topicName, {
              clients,
              transactions: topic.transactions,
            });
          }

          return topics;
        }, state.topics),
      };
    }
    case 'CLIENT_SUBSCRIBED': {
      const { topicName, client } = action.payload;
      const topic = state.topics.get(topicName);

      if (topic === undefined) {
        return {
          ...state,
          topics: state.topics.set(topicName, {
            clients: Set([client]),
            transactions: Map<string, TransactionStatus>(),
          }),
        };
      }

      return {
        ...state,
        topics: state.topics.set(topicName, {
          clients: topic.clients.add(client),
          transactions: topic.transactions,
        }),
      };
    }
    case 'CLIENT_UNSUBSCRIBED': {
      const { topicName, client } = action.payload;
      const topic = state.topics.get(topicName);

      if (topic === undefined) {
        return state;
      }

      const clients = topic.clients.delete(client);

      if (clients.size > 0) {
        return {
          ...state,
          topics: state.topics.set(topicName, {
            clients,
            transactions: topic.transactions,
          }),
        };
      } else if (clients.size === 0 && topic.transactions.size === 0) {
        return {
          ...state,
          topics: state.topics.delete(topicName),
        };
      } else {
        return state;
      }
    }
    case 'TRANSACTION_RECEIVED': {
      const { topicNames, transactionStatus } = action.payload;
      const newTopics = topicNames.reduce((newTopics, topicName) => {
        const topic = state.topics.get(topicName);

        if (topic === undefined) {
          return newTopics;
        }

        return newTopics.set(topicName, {
          clients: topic.clients,
          transactions: topic.transactions.set(
            transactionStatus.signature,
            transactionStatus
          ),
        });
      }, Map<string, TopicState>());

      return {
        ...state,
        topics: state.topics.merge(newTopics),
      };
    }
    case 'TRANSACTION_CONFIRMED': {
      const { topicNames, transactionStatus } = action.payload;
      const newTopics = topicNames.reduce((newTopics, topicName) => {
        const topic = state.topics.get(topicName);

        if (topic === undefined) {
          return newTopics;
        }

        return newTopics.set(topicName, {
          clients: topic.clients,
          transactions: topic.transactions.update(
            transactionStatus.signature,
            (transaction) => ({
              ...transaction,
              timestamp: transactionStatus.timestamp,
              status: transactionStatus.status,
            })
          ),
        });
      }, Map<string, TopicState>());

      return {
        ...state,
        topics: state.topics.merge(newTopics),
      };
    }
    case 'TRANSACTION_FINALIZED':
    case 'TRANSACTION_FAILED': {
      const { topicNames, transactionStatus } = action.payload;
      const newTopics = topicNames.reduce((newTopics, topicName) => {
        const topic = state.topics.get(topicName);

        if (topic === undefined) {
          return newTopics;
        }

        const transactions = topic.transactions.delete(
          transactionStatus.signature
        );

        if (topic.clients.size === 0 && transactions.size === 0) {
          return newTopics;
        }

        return newTopics.set(topicName, {
          clients: topic.clients,
          transactions,
        });
      }, Map<string, TopicState>());
      const garbageTopics = topicNames.reduce((garbageTopics, topicName) => {
        const topic = state.topics.get(topicName);

        if (topic === undefined) {
          return garbageTopics;
        }

        const transactions = topic.transactions.delete(
          transactionStatus.signature
        );

        if (topic.clients.size > 0 || transactions.size > 0) {
          return garbageTopics;
        }

        return garbageTopics.add(topicName);
      }, Set<string>());

      return {
        ...state,
        topics: state.topics.deleteAll(garbageTopics).merge(newTopics),
      };
    }

    default:
      return state;
  }
};
