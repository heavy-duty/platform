import { Inject, Injectable } from '@angular/core';
import { WebSocketStore } from '@heavy-duty/ngx-websocket';
import { HdBroadcasterConfig, HD_BROADCASTER_CONFIG } from './config';

@Injectable()
export class HdBroadcasterSocketStore extends WebSocketStore<string> {
  constructor(
    @Inject(HD_BROADCASTER_CONFIG)
    hdBroadcasterConfig: HdBroadcasterConfig
  ) {
    super(hdBroadcasterConfig.webSocketConfig);

    this.setEndpoint(hdBroadcasterConfig.url);
  }
}
