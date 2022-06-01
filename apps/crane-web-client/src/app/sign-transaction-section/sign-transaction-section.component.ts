import { Component, Input, Output } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { filter, map } from 'rxjs';
import { isNotNull, Option } from '../utils';
import { SignTransactionSectionStore } from './sign-transaction-section.store';

@Component({
	selector: 'crane-sign-transaction-section',
	template: `
		<section class="p-4">
			<h2>Sign transaction</h2>

			<div
				*ngIf="publicKey$ | async as publicKey"
				class="border-2 border-white p-2"
			>
				<p class="overflow-hidden whitespace-nowrap overflow-ellipsis">
					Wallet: {{ publicKey.toBase58() }}
				</p>

				<div class="flex gap-1">
					<button
						mat-raised-button
						color="primary"
						[cdkCopyToClipboard]="publicKey.toBase58()"
					>
						Copy
					</button>

					<button
						*ngIf="transaction$ | async as transaction"
						[disabled]="disabled$ | async"
						mat-raised-button
						color="accent"
						(click)="onSignTransactionWithWallet(publicKey, transaction)"
					>
						Sign
					</button>
				</div>
			</div>

			<crane-keypairs-list
				(signTransaction)="onSignTransactionWithKeypair($event)"
				[disabled]="(disabled$ | async) ?? false"
			></crane-keypairs-list>

			<ng-container *ngIf="transaction$ | async as transaction">
				<crane-signatures-progress
					*ngIf="signatures$ | async as signatures"
					[signaturesDone]="signatures.length"
					[signaturesRequired]="transaction.signatures.length"
				></crane-signatures-progress>
			</ng-container>
		</section>
	`,
	providers: [SignTransactionSectionStore],
})
export class SignTransactionSectionComponent {
	readonly publicKey$ = this._walletStore.publicKey$;
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

	constructor(
		private readonly _walletStore: WalletStore,
		private readonly _signTransactionSectionStore: SignTransactionSectionStore
	) {}

	onSignTransactionWithWallet(publicKey: PublicKey, transaction: Transaction) {
		const newTransaction = new Transaction();
		newTransaction.feePayer = transaction.feePayer;
		newTransaction.recentBlockhash = transaction.recentBlockhash;
		newTransaction.lastValidBlockHeight = transaction.lastValidBlockHeight;
		newTransaction.add(...transaction.instructions);

		console.log(newTransaction);

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
