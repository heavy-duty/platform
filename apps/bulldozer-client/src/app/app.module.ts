import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { PROGRAM_CONFIGS } from '@heavy-duty/ng-anchor';
<<<<<<< HEAD
import { HdWalletAdapterModule } from '@heavy-duty/wallet-adapter';
=======
import {
  ConnectionStore,
  WalletStore,
  WALLET_CONFIG,
} from '@heavy-duty/wallet-adapter';
>>>>>>> 005b4b4... refactor(bulldozer-client): re-organize libraries
import * as bulldozerIdl from '../assets/json/bulldozer.json';
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
            import('@heavy-duty/bulldozer/application/shell').then(
              (m) => m.ShellModule
            ),
        },
      ],
      { initialNavigation: 'enabledBlocking' }
    ),
    HdWalletAdapterModule.forRoot({
      autoConnect: true,
    }),
  ],
  providers: [
    {
      provide: PROGRAM_CONFIGS,
      useValue: {
        bulldozer: {
          id: environment.bulldozerProgramId,
          idl: bulldozerIdl,
        },
      },
    },
    ConnectionStore,
    WalletStore,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
