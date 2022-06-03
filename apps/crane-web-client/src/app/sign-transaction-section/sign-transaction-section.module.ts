import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { ReactiveComponentModule } from '@ngrx/component';
import { ScrewedCardModule } from '../components/screwed-card.module';
import { KeypairsSectionModule } from './keypairs-section.module';
import { SignTransactionSectionComponent } from './sign-transaction-section.component';
import { SignaturesProgressSectionModule } from './signatures-progress-section.module';
import { WalletSectionModule } from './wallet-section.module';

@NgModule({
	imports: [
		CommonModule,
		ClipboardModule,
		MatButtonModule,
		MatIconModule,
		ReactiveComponentModule,
		HdWalletAdapterCdkModule,
		KeypairsSectionModule,
		WalletSectionModule,
		SignaturesProgressSectionModule,
		ScrewedCardModule,
	],
	exports: [SignTransactionSectionComponent],
	declarations: [SignTransactionSectionComponent],
})
export class SignTransactionSectionModule {}
