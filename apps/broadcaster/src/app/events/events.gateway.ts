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
import { List, Map, Set } from 'immutable';
import WebSocket, { Server } from 'ws';
import { environment } from '../../environments/environment';

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
  private readonly _connection = new Connection(environment.rpcUrl, {
    confirmTransactionInitialTimeout: 120_000, // timeout for 2 minutes ~blockhash duration
  });

  private broadcastTransactionStatus(
    topicNames: List<string>,
    transactionStatus: TransactionStatus
  ) {
    topicNames.forEach((topicName) => {
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
    });
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
      topicNames,
    }: {
      transactionSignature: TransactionSignature;
      transaction: Transaction;
      topicNames: List<string>;
    }
  ) {
    this.broadcastTransactionStatus(topicNames, {
      signature: transactionSignature,
      timestamp: Date.now(),
      transaction,
    });

    topicNames.forEach((topicName) => {
      const topic = this._topics.get(topicName);

      if (topic !== undefined) {
        this._topics = this._topics.set(topicName, {
          clients: topic.clients,
          transactions: topic.transactions.set(transactionSignature, {
            signature: transactionSignature,
            timestamp: Date.now(),
            transaction,
          }),
        });
      }
    });

    this._logger.log(
      `Transaction received [${transactionSignature}]. (${topicNames.join(
        ', '
      )})`
    );

    try {
      await this._connection.confirmTransaction(
        transactionSignature,
        'confirmed'
      );
      this._logger.log(
        `Transaction confirmed [${transactionSignature}]. (${topicNames.join(
          ', '
        )})`
      );

      this.broadcastTransactionStatus(topicNames, {
        signature: transactionSignature,
        status: 'confirmed',
        timestamp: Date.now(),
        transaction,
      });

      topicNames.forEach((topicName) => {
        const topic = this._topics.get(topicName);

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
      });
    } catch (error) {
      this.broadcastTransactionStatus(topicNames, {
        signature: transactionSignature,
        timestamp: Date.now(),
        transaction,
        error: {
          name: 'ConfirmTransactionError',
          message: error.message,
        },
      });

      topicNames.forEach((topicName) => {
        const topic = this._topics.get(topicName);

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
      });

      return;
    }

    try {
      await this._connection.confirmTransaction(
        transactionSignature,
        'finalized'
      );

      this._logger.log(
        `Transaction finalized [${transactionSignature}]. (${topicNames.join(
          ', '
        )})`
      );

      this.broadcastTransactionStatus(topicNames, {
        signature: transactionSignature,
        status: 'finalized',
        timestamp: Date.now(),
        transaction,
      });

      topicNames.forEach((topicName) => {
        const topic = this._topics.get(topicName);

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
      });
    } catch (error) {
      this.broadcastTransactionStatus(topicNames, {
        signature: transactionSignature,
        timestamp: Date.now(),
        transaction,
        error: {
          name: 'ConfirmTransactionError',
          message: error.message,
        },
      });

      topicNames.forEach((topicName) => {
        const topic = this._topics.get(topicName);

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
      });

      return;
    }
  }
}
