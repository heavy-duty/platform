import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	inject,
	Input,
	Output,
} from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ReactiveComponentModule } from '@ngrx/component';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { filter, map } from 'rxjs';
import { isNotNull, Option } from '../../utils';
import { KeypairsSectionComponent } from './keypairs-section.component';
import { SignTransactionSectionStore } from './sign-transaction-section.store';
import { SignaturesProgressSectionComponent } from './signatures-progress-section.component';
import { WalletSectionComponent } from './wallet-section.component';

@Component({
	selector: 'crane-sign-transaction-section',
	template: `
		<ng-container *ngrxLet="publicKey$; let publicKey">
			<crane-wallet-section
				*ngrxLet="transaction$; let transaction"
				class="block"
				[publicKey]="publicKey"
				[wallet]="(wallet$ | ngrxPush) ?? null"
				[disabled]="(disabled$ | ngrxPush) ?? false"
				(signTransaction)="onSignTransactionWithWallet(publicKey, transaction)"
			></crane-wallet-section>
		</ng-container>

		<crane-keypairs-section
			class="block mt-4"
			[disabled]="(disabled$ | ngrxPush) ?? false"
			(signTransaction)="onSignTransactionWithKeypair($event)"
		></crane-keypairs-section>

		<ng-container *ngIf="transaction$ | ngrxPush as transaction">
			<crane-signatures-progress-section
				*ngIf="signatures$ | ngrxPush as signatures"
				class="block mt-4"
				[signaturesDone]="signatures.length"
				[signaturesRequired]="transaction.signatures.length"
			></crane-signatures-progress-section>
		</ng-container>
	`,
	providers: [SignTransactionSectionStore],
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [
		CommonModule,
		ReactiveComponentModule,
		KeypairsSectionComponent,
		WalletSectionComponent,
		SignaturesProgressSectionComponent,
	],
})
export class SignTransactionSectionComponent {
	private readonly _walletStore = inject(WalletStore);
	private readonly _signTransactionSectionStore = inject(
		SignTransactionSectionStore
	);

	readonly publicKey$ = this._walletStore.publicKey$;
	readonly wallet$ = this._walletStore.wallet$;
	readonly transaction$ = this._signTransactionSectionStore.transaction$;
	readonly disabled$ = this._signTransactionSectionStore.disabled$;
	readonly signatures$ = this._signTransactionSectionStore.signatures$;

	@Input() set transaction(value: Option<Transaction>) {
		if (
			value !== null &&
			value.feePayer !== undefined &&
			value.recentBlockhash !== undefined &&
			!value.verifySignatures()
		) {
			this._signTransactionSectionStore.startSigning(value);
		}
	}

	@Output() transactionSigned =
		this._signTransactionSectionStore.serviceState$.pipe(
			isNotNull,
			filter(
				(state) => state.matches('Transaction signed') && state.changed === true
			),
			map(({ context: { transaction } }) => transaction ?? null)
		);

	onSignTransactionWithWallet(
		publicKey: Option<PublicKey>,
		transaction: Option<Transaction>
	) {
		if (publicKey === null) {
			throw new Error('Wallet not connected.');
		}

		if (transaction === null) {
			throw new Error('Transaction is invalid.');
		}

		const newTransaction = new Transaction();
		newTransaction.feePayer = transaction.feePayer;
		newTransaction.recentBlockhash = transaction.recentBlockhash;
		newTransaction.lastValidBlockHeight = transaction.lastValidBlockHeight;
		newTransaction.add(...transaction.instructions);

		const signTransaction$ = this._walletStore.signTransaction(newTransaction);

		if (signTransaction$ === undefined) {
			throw new Error('Wallet selected cannot sign.');
		}

		this._signTransactionSectionStore.signTransactionWithWallet(
			signTransaction$.pipe(
				map((transaction) => ({
					publicKey,
					signature: transaction.signature,
				}))
			)
		);
	}

	onSignTransactionWithKeypair(keypair: Keypair) {
		this._signTransactionSectionStore.signTransactionWithKeypair(keypair);
	}
}
