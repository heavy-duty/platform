import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { ScrewedCardModule } from '../components/screwed-card.module';
import { WalletSectionComponent } from './wallet-section.component';

@NgModule({
	imports: [
		CommonModule,
		ClipboardModule,
		MatIconModule,
		HdWalletAdapterCdkModule,
		ScrewedCardModule,
	],
	exports: [WalletSectionComponent],
	declarations: [WalletSectionComponent],
	providers: [],
})
export class WalletSectionModule {}
