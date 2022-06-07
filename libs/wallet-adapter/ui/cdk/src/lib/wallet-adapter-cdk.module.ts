import { NgModule } from '@angular/core';
import { HdWalletConnectButtonDirective } from './connect-button.directive';
import { HdWalletDisconnectButtonDirective } from './disconnect-button.directive';
import { HdWalletListItemComponent } from './list-item.component';
import { HdWalletModalButtonDirective } from './modal-button.directive';
import { HdObscureAddressPipe } from './obscure-address.pipe';
import { HdWalletAdapterDirective } from './wallet-adapter.directive';
import { HdWalletIconComponent } from './wallet-icon.component';

@NgModule({
	imports: [
		HdWalletConnectButtonDirective,
		HdWalletDisconnectButtonDirective,
		HdObscureAddressPipe,
		HdWalletIconComponent,
		HdWalletAdapterDirective,
		HdWalletListItemComponent,
		HdWalletModalButtonDirective,
	],
	exports: [
		HdWalletConnectButtonDirective,
		HdWalletDisconnectButtonDirective,
		HdObscureAddressPipe,
		HdWalletIconComponent,
		HdWalletAdapterDirective,
		HdWalletListItemComponent,
		HdWalletModalButtonDirective,
	],
})
export class HdWalletAdapterCdkModule {}
