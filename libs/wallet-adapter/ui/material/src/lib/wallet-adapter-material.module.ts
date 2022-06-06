import { NgModule } from '@angular/core';
import { HdWalletConnectButtonComponent } from './connect-button.component';
import { HdWalletDisconnectButtonComponent } from './disconnect-button.component';
import { HdWalletModalButtonComponent } from './modal-button.component';
import { HdWalletModalButtonDirective } from './modal-button.directive';
import { HdWalletModalComponent } from './modal.component';
import { HdWalletMultiButtonComponent } from './multi-button.component';

@NgModule({
	imports: [
		HdWalletConnectButtonComponent,
		HdWalletDisconnectButtonComponent,
		HdWalletMultiButtonComponent,
		HdWalletModalButtonComponent,
		HdWalletModalComponent,
		HdWalletModalButtonDirective,
	],
	exports: [
		HdWalletConnectButtonComponent,
		HdWalletDisconnectButtonComponent,
		HdWalletMultiButtonComponent,
		HdWalletModalButtonComponent,
		HdWalletModalComponent,
		HdWalletModalButtonDirective,
	],
})
export class HdWalletAdapterMaterialModule {}
