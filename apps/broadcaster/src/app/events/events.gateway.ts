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
import { Connection, Transaction, TransactionSignature } from '@solana/web3.js';
import { List } from 'immutable';
import { v4 as uuid } from 'uuid';
import WebSocket, { Server } from 'ws';
import { environment } from '../../environments/environment';
import { EventsService } from './events.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly _logger = new Logger(EventsGateway.name);
  @WebSocketServer()
  private readonly _server: Server;
  private readonly _connection = new Connection(environment.rpcUrl, {
    confirmTransactionInitialTimeout: 120_000, // timeout for 2 minutes ~blockhash duration
  });

  constructor(private readonly _eventsService: EventsService) {}

  handleConnection(
    @ConnectedSocket()
    client: WebSocket
  ) {
    this._logger.log(
      `Client connected. [${this._server.clients.size} clients connected]`
    );

    this._eventsService.dispatch({
      type: 'CLIENT_CONNECTED',
      payload: client,
    });
  }

  handleDisconnect(
    @ConnectedSocket()
    client: WebSocket
  ) {
    this._logger.log(
      `Client disconnected. [${this._server.clients.size} clients connected]`
    );

    this._eventsService.dispatch({
      type: 'CLIENT_DISCONNECTED',
      payload: client,
    });
  }

  @SubscribeMessage('subscribe')
  onSubscribe(
    @ConnectedSocket()
    client: WebSocket,
    @MessageBody()
    {
      topicName,
      correlationId,
    }: {
      topicName: string;
      correlationId: string;
    }
  ) {
    this._logger.log(`Client subscribed to [${topicName}].`);

    this._eventsService.dispatch({
      type: 'CLIENT_SUBSCRIBED',
      payload: {
        client,
        topicName,
        subscriptionId: uuid(),
        correlationId,
      },
    });
  }

  @SubscribeMessage('unsubscribe')
  onUnsubscribe(
    @ConnectedSocket()
    client: WebSocket,
    @MessageBody()
    {
      topicName,
      subscriptionId,
    }: {
      topicName: string;
      subscriptionId: string;
    }
  ) {
    this._logger.log(`Client unsubscribed from [${topicName}].`);

    this._eventsService.dispatch({
      type: 'CLIENT_UNSUBSCRIBED',
      payload: {
        client,
        topicName,
        subscriptionId,
      },
    });
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
    this._logger.log(
      `Transaction received [${transactionSignature}]. (${topicNames.join(
        ', '
      )})`
    );

    this._eventsService.dispatch({
      type: 'TRANSACTION_RECEIVED',
      payload: {
        topicNames,
        transactionStatus: {
          transaction,
          signature: transactionSignature,
          timestamp: Date.now(),
        },
      },
    });

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

      this._eventsService.dispatch({
        type: 'TRANSACTION_CONFIRMED',
        payload: {
          topicNames,
          transactionStatus: {
            transaction,
            signature: transactionSignature,
            timestamp: Date.now(),
            status: 'confirmed',
          },
        },
      });

      await this._connection.confirmTransaction(
        transactionSignature,
        'finalized'
      );

      this._logger.log(
        `Transaction finalized [${transactionSignature}]. (${topicNames.join(
          ', '
        )})`
      );

      this._eventsService.dispatch({
        type: 'TRANSACTION_FINALIZED',
        payload: {
          topicNames,
          transactionStatus: {
            transaction,
            signature: transactionSignature,
            timestamp: Date.now(),
            status: 'finalized',
          },
        },
      });
    } catch (error) {
      this._logger.log(
        `Transaction failed [${transactionSignature}]. (${topicNames.join(
          ', '
        )})`
      );

      this._eventsService.dispatch({
        type: 'TRANSACTION_FAILED',
        payload: {
          topicNames,
          transactionStatus: {
            transaction,
            signature: transactionSignature,
            timestamp: Date.now(),
            error: {
              name: 'ConfirmTransactionError',
              message: error.message,
            },
          },
        },
      });
    }
  }
}
