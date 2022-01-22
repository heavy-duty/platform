import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ReactiveComponentModule } from '@ngrx/component';
import {
  WalletConnectButtonComponent,
  WalletConnectButtonDirective,
} from './connect-button';
import {
  WalletDisconnectButtonComponent,
  WalletDisconnectButtonDirective,
} from './disconnect-button';
import {
  WalletExpandComponent,
  WalletListItemComponent,
  WalletModalButtonComponent,
  WalletModalButtonDirective,
  WalletModalComponent,
} from './modal';
import { WalletMultiButtonComponent } from './multi-button';
import {
  ObscureAddressPipe,
  SanitizeUrlPipe,
  WalletIconComponent,
} from './shared';

@NgModule({
  imports: [
    CommonModule,
    ClipboardModule,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatToolbarModule,
    ReactiveComponentModule,
  ],
  exports: [
    WalletConnectButtonComponent,
    WalletConnectButtonDirective,
    WalletDisconnectButtonComponent,
    WalletDisconnectButtonDirective,
    WalletMultiButtonComponent,
    WalletModalButtonComponent,
    WalletModalButtonDirective,
    WalletModalComponent,
    WalletIconComponent,
  ],
  declarations: [
    WalletConnectButtonComponent,
    WalletConnectButtonDirective,
    WalletDisconnectButtonComponent,
    WalletDisconnectButtonDirective,
    WalletMultiButtonComponent,
    WalletModalButtonComponent,
    WalletModalButtonDirective,
    WalletModalComponent,
    WalletListItemComponent,
    WalletExpandComponent,
    WalletIconComponent,
    SanitizeUrlPipe,
    ObscureAddressPipe,
  ],
})
export class WalletAdapterUiModule {}
