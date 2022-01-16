import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ConnectionStore } from '@heavy-duty/bulldozer-store';
import { PROGRAM_CONFIGS } from '@heavy-duty/ng-anchor';
import { HdWalletAdapterModule, WalletStore } from '@heavy-duty/wallet-adapter';
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
