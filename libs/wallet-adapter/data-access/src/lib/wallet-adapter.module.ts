import { ModuleWithProviders, NgModule } from '@angular/core';
import { ConnectionConfig } from '@solana/web3.js';
import {
  connectionConfigProviderFactory,
  ConnectionStore,
} from './connection.store';
import {
  WalletConfig,
  walletConfigProviderFactory,
  WalletStore,
} from './wallet.store';

@NgModule({})
export class HdWalletAdapterModule {
  static forRoot(
    walletConfig: Partial<WalletConfig>,
    connectionConfig?: ConnectionConfig
  ): ModuleWithProviders<HdWalletAdapterModule> {
    return {
      ngModule: HdWalletAdapterModule,
      providers: [
        walletConfigProviderFactory(walletConfig),
        connectionConfigProviderFactory(connectionConfig),
        ConnectionStore,
        WalletStore,
      ],
    };
  }
}
