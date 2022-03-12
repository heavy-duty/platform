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
import WebSocket, { Server } from 'ws';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly _logger = new Logger(EventsGateway.name);
  @WebSocketServer()
  server: Server;
  private readonly _topics = new Map<string, Set<WebSocket>>();

  handleConnection(
    @ConnectedSocket()
    client: WebSocket
  ) {
    this._logger.log(
      `Client connected. [${this.server.clients.size} clients connected]`
    );

    this._topics.set('*', new Set([...(this._topics.get('*') ?? []), client]));
  }

  handleDisconnect(
    @ConnectedSocket()
    client: WebSocket
  ) {
    this._logger.log(
      `Client disconnected. [${this.server.clients.size} clients connected]`
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
}
