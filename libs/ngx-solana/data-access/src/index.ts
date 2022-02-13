export * from './lib/api.interceptor';
export * from './lib/api.service';
export * from './lib/config';
export * from './lib/connection.store';
export * from './lib/ngx-solana-data-access.module';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxSolanaApiInterceptor } from './lib/api.interceptor';

export const ngxSolanaApiInterceptorProviders = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: NgxSolanaApiInterceptor,
    multi: true,
  },
];
