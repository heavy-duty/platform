import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import {
  ngxSolanaApiInterceptorProviders,
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
  providers: [ngxSolanaApiInterceptorProviders],
})
export class AppModule {}
