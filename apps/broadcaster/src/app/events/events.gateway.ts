import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  Connection,
  Finality,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js';
import { Map, Set } from 'immutable';
import WebSocket, { Server } from 'ws';
import { environment } from '../../environments/environment';

export interface TransactionStatus {
  signature: TransactionSignature;
  status?: Finality;
  transaction: Transaction;
  timestamp: number;
}

export interface TopicState {
  clients: Set<WebSocket>;
  transactions: Map<string, TransactionStatus>;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly _logger = new Logger(EventsGateway.name);
  @WebSocketServer()
  private readonly _server: Server;
  private _topics = Map<string, TopicState>();
  private readonly _connection = new Connection(environment.rpcUrl);

  private broadcastTransactionStatus(
    topicName: string,
    transactionStatus: TransactionStatus
  ) {
    const topic = this._topics.get(topicName);

    if (topic !== undefined) {
      topic.clients.forEach((client) =>
        client.send(
          JSON.stringify({
            event: topicName,
            data: transactionStatus,
          })
        )
      );
    }
  }

  handleConnection(
    @ConnectedSocket()
    client: WebSocket
  ) {
    this._logger.log(
      `Client connected. [${this._server.clients.size} clients connected]`
    );

    const topic = this._topics.get('*');

    if (topic === undefined) {
      this._topics = this._topics.set('*', {
        clients: Set([client]),
        transactions: Map<string, TransactionStatus>(),
      });
    } else {
      this._topics = this._topics.set('*', {
        clients: Set(topic.clients).add(client),
        transactions: topic.transactions,
      });
    }
  }

  handleDisconnect(
    @ConnectedSocket()
    client: WebSocket
  ) {
    this._logger.log(
      `Client disconnected. [${this._server.clients.size} clients connected]`
    );

    this._topics.forEach((topic, topicName) => {
      const clients = topic.clients.delete(client);

      if (clients.size === 0 && topic.transactions.size === 0) {
        this._topics = this._topics.delete(topicName);
      }

      if (clients.size > 0) {
        this._topics = this._topics.set(topicName, {
          clients,
          transactions: topic.transactions,
        });
      }
    });
  }

  @SubscribeMessage('subscribe')
  onSubscribe(
    @ConnectedSocket()
    client: WebSocket,
    @MessageBody() topicName: string
  ) {
    this._logger.log(`Client subscribed to [${topicName}].`);

    const topic = this._topics.get(topicName);

    if (topic === undefined) {
      this._topics = this._topics.set(topicName, {
        clients: Set([client]),
        transactions: Map<string, TransactionStatus>(),
      });
    } else {
      topic.transactions.forEach((transactionStatus) => {
        client.send(
          JSON.stringify({
            event: topicName,
            data: transactionStatus,
          })
        );
      });

      this._topics = this._topics.set(topicName, {
        clients: topic.clients.add(client),
        transactions: topic.transactions,
      });
    }
  }

  @SubscribeMessage('unsubscribe')
  onUnsubscribe(
    @ConnectedSocket()
    client: WebSocket,
    @MessageBody() topicName: string
  ) {
    this._logger.log(`Client unsubscribed from [${topicName}].`);

    const topic = this._topics.get(topicName);

    if (topic !== undefined) {
      const clients = topic.clients.delete(client);

      if (clients.size > 0) {
        this._topics = this._topics.set(topicName, {
          clients: Set(clients),
          transactions: topic.transactions,
        });
      } else if (clients.size === 0 && topic.transactions.size === 0) {
        this._topics = this._topics.delete(topicName);
      }
    }
  }

  @SubscribeMessage('transaction')
  async onTransaction(
    @MessageBody()
    {
      transactionSignature,
      transaction,
      topicName,
    }: {
      transactionSignature: TransactionSignature;
      transaction: Transaction;
      topicName: string;
    }
  ) {
    this.broadcastTransactionStatus(topicName, {
      signature: transactionSignature,
      timestamp: Date.now(),
      transaction,
    });

    this._logger.log(
      `Transaction received [${transactionSignature}]. (${topicName})`
    );

    await this._connection.confirmTransaction(
      transactionSignature,
      'confirmed'
    );

    this._logger.log(
      `Transaction confirmed [${transactionSignature}]. (${topicName})`
    );

    let topic = this._topics.get(topicName);

    if (topic !== undefined) {
      this._topics = this._topics.set(topicName, {
        clients: topic.clients,
        transactions: topic.transactions.set(transactionSignature, {
          signature: transactionSignature,
          status: 'confirmed',
          timestamp: Date.now(),
          transaction,
        }),
      });
    }

    this.broadcastTransactionStatus(topicName, {
      signature: transactionSignature,
      status: 'confirmed',
      timestamp: Date.now(),
      transaction,
    });

    await this._connection.confirmTransaction(
      transactionSignature,
      'finalized'
    );

    this._logger.log(
      `Transaction finalized [${transactionSignature}]. (${topicName})`
    );

    topic = this._topics.get(topicName);

    if (topic !== undefined) {
      const transactions = topic.transactions.delete(transactionSignature);

      if (topic.clients.size === 0 && transactions.size === 0) {
        this._topics = this._topics.delete(topicName);
      } else {
        this._topics = this._topics.set(topicName, {
          clients: topic.clients,
          transactions,
        });
      }
    }

    this.broadcastTransactionStatus(topicName, {
      signature: transactionSignature,
      status: 'finalized',
      timestamp: Date.now(),
      transaction,
    });
  }
}
