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
  TransactionResponse,
  TransactionSignature,
} from '@solana/web3.js';
import WebSocket, { Server } from 'ws';
import { environment } from '../../environments/environment';

export interface TransactionStatus {
  signature: TransactionSignature;
  status: Finality;
  transactionResponse: TransactionResponse;
  timestamp: number;
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
  private readonly _topics = new Map<string, Set<WebSocket>>();
  private readonly _connection = new Connection(environment.rpcUrl);

  private broadcastTransactionStatus(
    topic: string,
    transactionStatus: TransactionStatus
  ) {
    this._topics.get(topic)?.forEach((client) =>
      client.send(
        JSON.stringify({
          event: topic,
          data: transactionStatus,
        })
      )
    );
  }

  handleConnection(
    @ConnectedSocket()
    client: WebSocket
  ) {
    this._logger.log(
      `Client connected. [${this._server.clients.size} clients connected]`
    );

    this._topics.set('*', new Set([...(this._topics.get('*') ?? []), client]));
  }

  handleDisconnect(
    @ConnectedSocket()
    client: WebSocket
  ) {
    this._logger.log(
      `Client disconnected. [${this._server.clients.size} clients connected]`
    );

    this._topics.forEach((_, topic) => {
      const clients = [...(this._topics.get(topic) ?? [])].filter(
        (ws) => ws !== client
      );

      if (clients.length === 0) {
        this._topics.delete(topic);
      } else {
        this._topics.set(topic, new Set(clients));
      }
    });
  }

  @SubscribeMessage('subscribe')
  onSubscribe(
    @ConnectedSocket()
    client: WebSocket,
    @MessageBody() topic: string
  ) {
    this._logger.log(`Client subscribed to [${topic}].`);

    this._topics.set(
      topic,
      new Set([...(this._topics.get(topic) ?? []), client])
    );
  }

  @SubscribeMessage('unsubscribe')
  onUnsubscribe(
    @ConnectedSocket()
    client: WebSocket,
    @MessageBody() topic: string
  ) {
    this._logger.log(`Client unsubscribed from [${topic}].`);

    const clients = [...(this._topics.get(topic) ?? [])].filter(
      (ws) => ws !== client
    );

    if (clients.length === 0) {
      this._topics.delete(topic);
    } else {
      this._topics.set(topic, new Set(clients));
    }
  }

  @SubscribeMessage('transaction')
  async onTransaction(
    @MessageBody()
    {
      transactionSignature,
      topic,
    }: {
      transactionSignature: TransactionSignature;
      topic: string;
    }
  ) {
    this._logger.log(`Transaction received [${transactionSignature}].`);

    await this._connection.confirmTransaction(
      transactionSignature,
      'confirmed'
    );

    this._logger.log(`Transaction confirmed [${transactionSignature}].`);

    const transactionResponse = await this._connection.getTransaction(
      transactionSignature,
      { commitment: 'confirmed' }
    );

    this.broadcastTransactionStatus(topic, {
      signature: transactionSignature,
      status: 'confirmed',
      timestamp: Date.now(),
      transactionResponse,
    });

    await this._connection.confirmTransaction(
      transactionSignature,
      'finalized'
    );

    this._logger.log(`Transaction finalized [${transactionSignature}].`);

    this.broadcastTransactionStatus(topic, {
      signature: transactionSignature,
      status: 'finalized',
      timestamp: Date.now(),
      transactionResponse,
    });
  }
}
