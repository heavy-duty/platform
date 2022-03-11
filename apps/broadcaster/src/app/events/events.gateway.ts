import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import WebSocket, { Server } from 'ws';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly _logger = new Logger(EventsGateway.name);
  @WebSocketServer()
  server: Server;
  private readonly _topics = new Map<string, Set<WebSocket>>();

  afterInit() {
    this._topics.set('*', new Set<WebSocket>());
  }

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

    this._topics.set(
      '*',
      new Set([...(this._topics.get('*') ?? [])].filter((ws) => ws !== client))
    );
  }
}
