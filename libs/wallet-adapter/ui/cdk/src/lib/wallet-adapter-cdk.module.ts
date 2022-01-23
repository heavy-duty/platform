import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HdWalletConnectButtonDirective } from './connect-button.directive';
import { HdWalletDisconnectButtonDirective } from './disconnect-button.directive';
import { HdSanitizeUrlPipe } from './internals';
import { HdWalletListItemComponent } from './list-item.component';
import { HdObscureAddressPipe } from './obscure-address.pipe';
import { HdWalletAdapterDirective } from './wallet-adapter.directive';
import { HdWalletIconComponent } from './wallet-icon.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    HdWalletConnectButtonDirective,
    HdWalletDisconnectButtonDirective,
    HdSanitizeUrlPipe,
    HdObscureAddressPipe,
    HdWalletIconComponent,
    HdWalletAdapterDirective,
    HdWalletListItemComponent,
  ],
  exports: [
    HdWalletConnectButtonDirective,
    HdWalletDisconnectButtonDirective,
    HdObscureAddressPipe,
    HdWalletIconComponent,
    HdWalletAdapterDirective,
    HdWalletListItemComponent,
  ],
})
export class HdWalletAdapterCdkModule {}
