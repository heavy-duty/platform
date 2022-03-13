import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { HdSolanaApiService } from './api.service';
import { hdSolanaConfigProviderFactory } from './config';
import { HdSolanaConfigStore } from './config.store';
import { HdSolanaConnectionStore } from './connection.store';
import { HdSolanaTransactionsStore } from './transactions.store';

@NgModule({
  imports: [HttpClientModule],
})
export class HdSolanaModule {
  static forRoot(): ModuleWithProviders<HdSolanaModule> {
    return {
      ngModule: HdSolanaModule,
      providers: [
        hdSolanaConfigProviderFactory({
          webSocketConfig: {
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
        HdSolanaApiService,
        HdSolanaConnectionStore,
        HdSolanaTransactionsStore,
        HdSolanaConfigStore,
      ],
    };
  }
}
