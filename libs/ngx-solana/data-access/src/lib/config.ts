import { InjectionToken } from '@angular/core';
import { WebSocketConfig } from '@heavy-duty/ngx-websocket';

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

export interface NgxSolanaConfig {
  apiEndpoint: string;
  webSocket: WebSocketConfig;
  network: string;
}

export const NGX_SOLANA_CONFIG = new InjectionToken<NgxSolanaConfig>(
  'rpcConfig'
);

export const ngxSolanaConfigProviderFactory = (
  config: RecursivePartial<NgxSolanaConfig>
) => ({
  provide: NGX_SOLANA_CONFIG,
  useValue: config,
});
