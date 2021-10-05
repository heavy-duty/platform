import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { SanitizeUrlModule } from '@heavy-duty/bulldozer/application/utils/pipes/sanitize-url';
import { ReactiveComponentModule } from '@ngrx/component';

import { ConnectWalletComponent } from './connect-wallet.component';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatListModule,
    ReactiveComponentModule,
    SanitizeUrlModule,
  ],
  declarations: [ConnectWalletComponent],
})
export class ConnectWalletModule {}
