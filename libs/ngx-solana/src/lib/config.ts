import { InjectionToken } from '@angular/core';

export interface NgxSolanaConfig {
  apiEndpoint: string;
  websocketEndpoint: string;
}

export const NGX_SOLANA_CONFIG = new InjectionToken<NgxSolanaConfig>(
  'rpcConfig'
);

export const ngxSolanaConfigProviderFactory = (config: NgxSolanaConfig) => ({
  provide: NGX_SOLANA_CONFIG,
  useValue: config,
});
