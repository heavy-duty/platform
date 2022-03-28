import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { WebSocketConfig, WebSocketEndpoint } from '@heavy-duty/ngx-websocket';
import { HdBroadcasterSocketStore } from './broadcaster-socket.store';
import { HdBroadcasterStore } from './broadcaster.store';
import { hdBroadcasterConfigProviderFactory } from './config';

@NgModule({
  imports: [HttpClientModule],
})
export class HdBroadcasterModule {
  static forRoot(
    url: WebSocketEndpoint,
    webSocketConfig?: WebSocketConfig
  ): ModuleWithProviders<HdBroadcasterModule> {
    return {
      ngModule: HdBroadcasterModule,
      providers: [
        hdBroadcasterConfigProviderFactory({
          url,
          webSocketConfig: webSocketConfig ?? {
            reconnection: true,
            reconnectionDelay: 1_000, // 1 second
            reconnectionDelayMax: 300_000, // 5 minutes
            heartBeatDelay: 30_000, // 30 seconds
            heartBeatMessage: JSON.stringify({
              jsonrpc: '2.0',
              method: 'ping',
              params: null,
            }),
          },
        }),
        HdBroadcasterSocketStore,
        HdBroadcasterStore,
      ],
    };
  }
}
