import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '@bulldozer-client/auth-guard';
import { AuthInterceptor } from '@bulldozer-client/auth-interceptor';
import {
  NgxSolanaApiInterceptor,
  NgxSolanaModule,
} from '@heavy-duty/ngx-solana';
import { HdWalletAdapterModule } from '@heavy-duty/wallet-adapter';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(
      [
        {
          path: '',
          loadChildren: () =>
            import('@bulldozer-client/shell').then((m) => m.ShellModule),
          canActivate: [AuthGuard],
        },
        {
          path: 'unauthorized-access',
          loadChildren: () =>
            import('@bulldozer-client/unauthorized-access').then(
              (m) => m.UnauthorizedAccessModule
            ),
        },
      ],
      { initialNavigation: 'enabledBlocking' }
    ),
    HdWalletAdapterModule.forRoot({
      autoConnect: true,
    }),
    NgxSolanaModule.forRoot(environment.rpcEndpoint, environment.rpcWebsocket),
  ],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NgxSolanaApiInterceptor,
      multi: true,
    },
  ],
})
export class AppModule {}
