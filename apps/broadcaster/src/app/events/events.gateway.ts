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
import { Connection, TransactionSignature } from '@solana/web3.js';
import WebSocket, { Server } from 'ws';

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
  private readonly _connection = new Connection('http://localhost:8899');

  private broadcastTransaction(
    emitter: WebSocket,
    event: string,
    transactionSignature: TransactionSignature,
    topics: string[]
  ) {
    const clients = topics.reduce(
      (clients, topic) =>
        new Set([...clients, ...(this._topics.get(topic) ?? [])]),
      new Set<WebSocket>()
    );

    emitter.send(
      JSON.stringify({
        event,
        data: transactionSignature,
      })
    );

    if (topics) {
      clients.forEach((client) => {
        if (client !== emitter) {
          client.send(
            JSON.stringify({
              event,
              data: transactionSignature,
            })
          );
        }
      });
    }
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
    @MessageBody() topics: string[]
  ) {
    this._logger.log(`Client subscribed to [${topics.join(', ')}].`);

    topics.forEach((topic) =>
      this._topics.set(
        topic,
        new Set([...(this._topics.get(topic) ?? []), client])
      )
    );
  }

  @SubscribeMessage('unsubscribe')
  onUnsubscribe(
    @ConnectedSocket()
    client: WebSocket,
    @MessageBody() topics: string[]
  ) {
    this._logger.log(`Client unsubscribed from [${topics.join(', ')}].`);

    topics.forEach((topic) => {
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

  @SubscribeMessage('transaction')
  async onTransaction(
    @ConnectedSocket()
    client: WebSocket,
    @MessageBody()
    {
      transactionSignature,
      topics,
    }: { transactionSignature: TransactionSignature; topics?: string[] }
  ) {
    this._logger.log(`Transaction received [${transactionSignature}].`);

    await this._connection.confirmTransaction(
      transactionSignature,
      'confirmed'
    );

    this._logger.log(`Transaction confirmed [${transactionSignature}].`);

    this.broadcastTransaction(
      client,
      'transactionConfirmed',
      transactionSignature,
      topics ?? []
    );

    await this._connection.confirmTransaction(
      transactionSignature,
      'finalized'
    );

    this._logger.log(`Transaction finalized [${transactionSignature}].`);

    this.broadcastTransaction(
      client,
      'transactionFinalized',
      transactionSignature,
      topics ?? []
    );
  }
}
