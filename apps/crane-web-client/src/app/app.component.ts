import { Component, OnInit, ViewChild } from '@angular/core';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { Blockhash, Transaction, TransactionSignature } from '@solana/web3.js';
import { BehaviorSubject } from 'rxjs';
import { BlockhashStatusSectionComponent } from './blockhash-status-section/blockhash-status-section.component';
import { Option } from './utils';

@Component({
	selector: 'crane-root',
	template: `
		<div class="flex justify-between">
			<main class="flex-1">
				<crane-create-transaction-section
					(transactionCreated)="onTransactionCreated($event)"
				>
				</crane-create-transaction-section>
			</main>

			<aside class="w-80">
				<ng-container *ngrxLet="transaction$; let transaction">
					<crane-blockhash-status-section
						*ngrxLet="latestBlockhash$; let latestBlockhash"
						(blockhashChanged)="
							onBlockhashChanged(
								transaction,
								$event.blockhash,
								$event.lastValidBlockHeight
							)
						"
						(blockhashExpired)="onBlockhashExpired(transaction)"
						#blockhashStatusSection
					></crane-blockhash-status-section>
				</ng-container>

				<crane-sign-transaction-section
					[transaction]="transaction$ | async"
					(transactionSigned)="onTransactionSignDone($event)"
				>
				</crane-sign-transaction-section>

				<crane-send-transaction-button
					[transaction]="transaction$ | async"
					(transactionSent)="onTransactionSent($event)"
				>
				</crane-send-transaction-button>

				<crane-confirm-transaction-button
					[signature]="signature$ | async"
					(transactionConfirmed)="onTransactionConfirmed()"
				>
				</crane-confirm-transaction-button>
			</aside>
		</div>
	`,
	styles: [],
	providers: [ConnectionStore, WalletStore],
})
export class AppComponent implements OnInit {
	@ViewChild('blockhashStatusSection')
	blockhashStatusSection: Option<BlockhashStatusSectionComponent> = null;
	private readonly _transaction = new BehaviorSubject<Option<Transaction>>(
		null
	);
	private readonly _latestBlockhash = new BehaviorSubject<
		Option<{ blockhash: string; lastValidBlockHeight: number }>
	>(null);
	private readonly _signature = new BehaviorSubject<
		Option<TransactionSignature>
	>(null);
	readonly transaction$ = this._transaction.asObservable();
	readonly latestBlockhash$ = this._latestBlockhash.asObservable();
	readonly signature$ = this._signature.asObservable();

	constructor(
		private readonly _connectionStore: ConnectionStore,
		private readonly _walletStore: WalletStore
	) {}

	ngOnInit() {
		this._walletStore.setAdapters([new PhantomWalletAdapter()]);
		this._connectionStore.setEndpoint('http://localhost:8899');

		this._walletStore.connect().subscribe();
	}

	onTransactionCreated(transaction: Option<Transaction>) {
		this._transaction.next(transaction);
		this.blockhashStatusSection?.loadBlockhash();
	}

	onTransactionSignDone(transaction: Option<Transaction>) {
		const newTransaction = new Transaction();

		newTransaction.feePayer = transaction?.feePayer;
		newTransaction.recentBlockhash = transaction?.recentBlockhash;
		newTransaction.lastValidBlockHeight = transaction?.lastValidBlockHeight;
		newTransaction.add(...(transaction?.instructions ?? []));
		transaction?.signatures.forEach(({ signature, publicKey }) => {
			if (signature !== null) {
				newTransaction.addSignature(publicKey, signature);
			}
		});

		this._transaction.next(newTransaction);
	}

	onTransactionSent(signature: Option<TransactionSignature>) {
		this._signature.next(signature);
	}

	onTransactionConfirmed() {
		console.log('confirmed');
	}

	onBlockhashChanged(
		transaction: Option<Transaction>,
		blockhash: Option<Blockhash>,
		lastValidBlockHeight: Option<number>
	) {
		if (
			transaction !== null &&
			blockhash !== null &&
			lastValidBlockHeight !== null
		) {
			this._transaction.next(
				new Transaction({
					feePayer: transaction.feePayer,
					signatures: transaction.signatures,
					blockhash,
					lastValidBlockHeight,
				}).add(...transaction.instructions)
			);
		}
	}

	onBlockhashExpired(transaction: Option<Transaction>) {
		if (transaction !== null) {
			const newTransaction = new Transaction();
			newTransaction.feePayer = transaction.feePayer;
			newTransaction.add(...transaction.instructions);

			this._transaction.next(newTransaction);
		}
	}
}
