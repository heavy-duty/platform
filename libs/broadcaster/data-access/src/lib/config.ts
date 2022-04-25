import { InjectionToken } from '@angular/core';
import { WebSocketConfig, WebSocketEndpoint } from '@heavy-duty/ngx-websocket';

export interface HdBroadcasterConfig {
  url: WebSocketEndpoint;
  webSocketConfig: WebSocketConfig;
}

export const HD_BROADCASTER_CONFIG = new InjectionToken<HdBroadcasterConfig>(
  'broadcasterConfig'
);

export const hdBroadcasterConfigProviderFactory = (
  config: HdBroadcasterConfig
) => ({
  provide: HD_BROADCASTER_CONFIG,
  useValue: config,
});
