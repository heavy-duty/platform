import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { NgxSolanaApiService } from './api.service';
import { ngxSolanaConfigProviderFactory } from './config';
import { NgxSolanaConnectionStore } from './connection.store';

@NgModule({
  imports: [HttpClientModule],
})
export class NgxSolanaModule {
  static forRoot(
    apiEndpoint: string,
    websocketEndpoint: string,
    network: string
  ): ModuleWithProviders<NgxSolanaModule> {
    return {
      ngModule: NgxSolanaModule,
      providers: [
        ngxSolanaConfigProviderFactory({
          apiEndpoint,
          webSocket: {
            endpoint: websocketEndpoint,
            reconnection: true,
            reconnectionDelay: 1000,
            heartBeatDelay: 30_000,
            heartBeatMessage: JSON.stringify({
              jsonrpc: '2.0',
              method: 'ping',
              params: null,
            }),
            autoConnect: true,
          },
          network,
        }),
        NgxSolanaApiService,
        NgxSolanaConnectionStore,
      ],
    };
  }
}
