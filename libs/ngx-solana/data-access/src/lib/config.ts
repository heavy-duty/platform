import { InjectionToken } from '@angular/core';
import { WebSocketConfig } from '@heavy-duty/ngx-websocket';

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

export interface HdSolanaConfig {
  webSocketConfig: WebSocketConfig;
}

export const HD_SOLANA_CONFIG = new InjectionToken<HdSolanaConfig>('rpcConfig');

export const hdSolanaConfigProviderFactory = (
  config: RecursivePartial<HdSolanaConfig>
) => ({
  provide: HD_SOLANA_CONFIG,
  useValue: config,
});
