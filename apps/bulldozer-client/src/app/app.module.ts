import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '@bulldozer-client/auth-guard';
import { AuthInterceptor } from '@bulldozer-client/auth-interceptor';
import { UserInstructionsStore } from '@bulldozer-client/users-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { HdBroadcasterModule } from '@heavy-duty/broadcaster';
import {
  HdSolanaApiInterceptor,
  HdSolanaModule,
  HdSolanaTransactionsInterceptor,
} from '@heavy-duty/ngx-solana';
import { HdWalletAdapterModule } from '@heavy-duty/wallet-adapter';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NoopAnimationsModule,
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
      {
        initialNavigation: 'enabledNonBlocking',
        paramsInheritanceStrategy: 'always',
      }
    ),
    HdWalletAdapterModule.forRoot({
      autoConnect: true,
    }),
    HdSolanaModule.forRoot(),
    HdBroadcasterModule.forRoot(environment.broadcasterWebsocket),
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
      useClass: HdSolanaApiInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HdSolanaTransactionsInterceptor,
      multi: true,
    },
    UserInstructionsStore,
    WorkspaceInstructionsStore,
  ],
})
export class AppModule {}
