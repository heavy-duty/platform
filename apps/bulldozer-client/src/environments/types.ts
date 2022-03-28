import { HttpEndpoint } from '@heavy-duty/ngx-solana';
import { Network, WebSocketEndpoint } from '@heavy-duty/ngx-websocket';

export interface Environment {
  production: boolean;
  rpcEndpoint: HttpEndpoint;
  rpcWebsocket: WebSocketEndpoint;
  network: Network;
  broadcasterWebsocket: WebSocketEndpoint;
}
