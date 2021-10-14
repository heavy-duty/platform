import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { WALLET_CONFIG } from '@danmt/wallet-adapter-angular';
import { PROGRAM_CONFIG } from '@heavy-duty/bulldozer/data-access';
import {
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletWallet,
} from '@solana/wallet-adapter-wallets';

import * as idl from '../assets/json/bulldozer.json';
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
            import('@heavy-duty/bulldozer/shell').then((m) => m.ShellModule),
        },
      ],
      { initialNavigation: 'enabledBlocking' }
    ),
  ],
  providers: [
    {
      provide: WALLET_CONFIG,
      useValue: {
        wallets: [
          getPhantomWallet(),
          getSolletWallet(),
          getSlopeWallet(),
          getSolflareWallet(),
        ],
        autoConnect: true,
      },
    },
    {
      provide: PROGRAM_CONFIG,
      useValue: {
        id: environment.programId,
        idl,
      },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
