import { Finality, Transaction, TransactionSignature } from '@solana/web3.js';
import { List, Map, Set } from 'immutable';
import WebSocket from 'ws';

export interface TransactionStatus {
  signature: TransactionSignature;
  status?: Finality;
  error?: unknown;
  transaction: Transaction;
  timestamp: number;
}

export interface TopicState {
  clients: Set<WebSocket>;
  transactions: Map<string, TransactionStatus>;
}

export interface State {
  topics: Map<string, TopicState>;
  clients: Set<WebSocket>;
}

export interface ClientConnected {
  type: 'CLIENT_CONNECTED';
  payload: WebSocket;
}

export interface ClientDisconnected {
  type: 'CLIENT_DISCONNECTED';
  payload: WebSocket;
}

export interface ClientSubscribed {
  type: 'CLIENT_SUBSCRIBED';
  payload: {
    topicName: string;
    client: WebSocket;
  };
}

export interface ClientUnsubscribed {
  type: 'CLIENT_UNSUBSCRIBED';
  payload: {
    topicName: string;
    client: WebSocket;
  };
}

export interface TransactionReceived {
  type: 'TRANSACTION_RECEIVED';
  payload: {
    topicNames: List<string>;
    transactionStatus: TransactionStatus;
  };
}

export interface TransactionConfirmed {
  type: 'TRANSACTION_CONFIRMED';
  payload: {
    topicNames: List<string>;
    transactionStatus: TransactionStatus;
  };
}

export interface TransactionFinalized {
  type: 'TRANSACTION_FINALIZED';
  payload: {
    topicNames: List<string>;
    transactionStatus: TransactionStatus;
  };
}

export interface TransactionFailed {
  type: 'TRANSACTION_FAILED';
  payload: {
    topicNames: List<string>;
    transactionStatus: TransactionStatus;
  };
}

export type ActionTypes =
  | ClientConnected
  | ClientDisconnected
  | ClientSubscribed
  | ClientUnsubscribed
  | TransactionReceived
  | TransactionConfirmed
  | TransactionFinalized
  | TransactionFailed;
