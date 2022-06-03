import { Component, Input, Output } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { filter, map } from 'rxjs';
import { isNotNull, Option } from '../utils';
import { SignTransactionSectionStore } from './sign-transaction-section.store';

@Component({
	selector: 'crane-sign-transaction-section',
	template: `
		<crane-screwed-card
			class="mt-4 bg-black bp-bg-metal-2 px-6 py-4 rounded block"
			*ngIf="publicKey$ | async as publicKey"
		>
			<header class="flex justify-between items-center mb-2">
				<h2 class="text-xl">Wallet</h2>
				<button
					class="bg-black h-full p-1 bp-button uppercase text-xs"
					*ngrxLet="transaction$; let transaction"
					[disabled]="disabled$ | async"
					(click)="onSignTransactionWithWallet(publicKey, transaction)"
				>
					Sign <mat-icon inline>check_circle</mat-icon>
				</button>
			</header>

			<p class="flex items-center gap-2 px-2 bg-black bg-opacity-40 rounded-md">
				<hd-wallet-icon
					*ngIf="wallet$ | ngrxPush as wallet"
					class="flex-shrink-0"
					[wallet]="wallet"
				></hd-wallet-icon>

				<span class="overflow-hidden whitespace-nowrap overflow-ellipsis">
					{{ publicKey.toBase58() }}
				</span>

				<button mat-icon-button [cdkCopyToClipboard]="publicKey.toBase58()">
					<mat-icon>content_copy</mat-icon>
				</button>
			</p>
		</crane-screwed-card>

		<crane-screwed-card
			class="mt-4 bg-black bp-bg-metal-2 px-6 py-4 rounded block"
		>
			<crane-keypairs-list
				(signTransaction)="onSignTransactionWithKeypair($event)"
				[disabled]="(disabled$ | async) ?? false"
			></crane-keypairs-list>
		</crane-screwed-card>

		<crane-screwed-card
			class="mt-4 bg-black bp-bg-metal-2 px-6 py-4 rounded block"
			*ngIf="transaction$ | async as transaction"
		>
			<crane-signatures-progress
				*ngIf="signatures$ | async as signatures"
				[signaturesDone]="signatures.length"
				[signaturesRequired]="transaction.signatures.length"
			></crane-signatures-progress>
		</crane-screwed-card>
	`,
	providers: [SignTransactionSectionStore],
})
export class SignTransactionSectionComponent {
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

	constructor(
		private readonly _walletStore: WalletStore,
		private readonly _signTransactionSectionStore: SignTransactionSectionStore
	) {}

	onSignTransactionWithWallet(
		publicKey: PublicKey,
		transaction: Option<Transaction>
	) {
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
