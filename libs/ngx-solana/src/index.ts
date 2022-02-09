export * from './lib/api-auth.interceptor';
export * from './lib/api.interceptor';
export * from './lib/api.service';
export * from './lib/config';
export * from './lib/ngx-solana.module';
export * from './lib/socket.service';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxSolanaApiAuthInterceptor } from './lib/api-auth.interceptor';
import { NgxSolanaApiInterceptor } from './lib/api.interceptor';

export const ngxSolanaApiInterceptorProviders = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: NgxSolanaApiAuthInterceptor,
    multi: true,
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: NgxSolanaApiInterceptor,
    multi: true,
  },
];
