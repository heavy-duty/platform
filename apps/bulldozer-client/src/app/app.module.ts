import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { PROGRAM_CONFIGS } from '@heavy-duty/ng-anchor';
import { WALLET_CONFIG } from '@heavy-duty/wallet-adapter';

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
        autoConnect: true,
      },
    },
    {
      provide: PROGRAM_CONFIGS,
      useValue: {
        bulldozer: {
          id: environment.bulldozerProgramId,
          idl: bulldozerIdl,
        },
      },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
