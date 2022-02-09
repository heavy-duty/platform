import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { NgxSolanaApiService } from './api.service';
import { ngxSolanaConfigProviderFactory } from './config';
import { NgxSolanaSocketService } from './socket.service';

@NgModule({
  imports: [HttpClientModule],
})
export class NgxSolanaModule {
  static forRoot(
    apiEndpoint: string,
    websocketEndpoint: string
  ): ModuleWithProviders<NgxSolanaModule> {
    return {
      ngModule: NgxSolanaModule,
      providers: [
        ngxSolanaConfigProviderFactory({ apiEndpoint, websocketEndpoint }),
        NgxSolanaApiService,
        NgxSolanaSocketService,
      ],
    };
  }
}
