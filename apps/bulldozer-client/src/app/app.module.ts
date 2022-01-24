import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { BulldozerProgramModule } from '@heavy-duty/bulldozer-store';
import { HdWalletAdapterModule } from '@heavy-duty/wallet-adapter';
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
    BulldozerProgramModule.forRoot(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
