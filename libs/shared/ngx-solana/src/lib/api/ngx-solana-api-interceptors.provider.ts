import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxSolanaApiAuthInterceptor } from './ngx-solana-api-auth.interceptor';
import { NgxSolanaApiInterceptor } from './ngx-solana-api.interceptor';

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
