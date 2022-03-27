import { Injectable } from '@angular/core';
import { WebSocketStore } from '@heavy-duty/ngx-websocket';

@Injectable()
export class HdBroadcasterSocketStore extends WebSocketStore<string> {
  constructor() {
    super({
      reconnection: true,
      reconnectionDelay: 1_000, // 1 second
      reconnectionDelayMax: 300_000, // 5 minutes
      heartBeatDelay: 30_000, // 30 seconds
      heartBeatMessage: JSON.stringify({
        jsonrpc: '2.0',
        method: 'ping',
        params: null,
      }),
    });

    this.setEndpoint('ws://localhost:3333');
  }
}
