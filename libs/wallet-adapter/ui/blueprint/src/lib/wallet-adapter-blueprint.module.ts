import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BlueprintButtonModule } from '@heavy-duty/blueprint-button';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { ReactiveComponentModule } from '@ngrx/component';
import { HdWalletConnectButtonComponent } from './connect-button.component';
import { HdWalletDisconnectButtonComponent } from './disconnect-button.component';
import { HdWalletModalButtonComponent } from './modal-button.component';
import { HdWalletModalComponent } from './modal.component';
import { HdWalletMultiButtonComponent } from './multi-button.component';

@NgModule({
	imports: [
		CommonModule,
		ClipboardModule,
		BlueprintButtonModule,
		MatButtonModule,
		MatExpansionModule,
		MatIconModule,
		MatListModule,
		MatMenuModule,
		MatToolbarModule,
		ReactiveComponentModule,
		HdWalletAdapterCdkModule,
	],
	exports: [
		HdWalletConnectButtonComponent,
		HdWalletDisconnectButtonComponent,
		HdWalletMultiButtonComponent,
		HdWalletModalButtonComponent,
		HdWalletModalComponent,
	],
	declarations: [
		HdWalletConnectButtonComponent,
		HdWalletDisconnectButtonComponent,
		HdWalletMultiButtonComponent,
		HdWalletModalButtonComponent,
		HdWalletModalComponent,
	],
})
export class HdWalletAdapterBlueprintModule {}
