import { Component, OnInit, ViewChild } from '@angular/core';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import {
	PhantomWalletAdapter,
	SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { Blockhash, Transaction, TransactionSignature } from '@solana/web3.js';
import { BehaviorSubject } from 'rxjs';
import { BlockhashStatusSectionComponent } from './blockhash-status-section/blockhash-status-section.component';
import { NotificationService } from './services/notification.service';
import { Option } from './utils';

@Component({
	selector: 'crane-root',
	template: `
		<div class="flex justify-between h-screen">
			<main class="flex-1 h-screen">
				<crane-create-transaction-section
					(transactionCreated)="onTransactionCreated($event)"
				>
				</crane-create-transaction-section>
			</main>

			<mat-sidenav
				#settings
				class="h-screen w-80 bp-bg-wood bg-bp-brown p-4 overflow-y-scroll"
				[opened]="true"
				fixedInViewport
				position="end"
				mode="side"
			>
				<crane-sign-transaction-section
					[transaction]="transaction$ | async"
					(transactionSigned)="onTransactionSignDone($event)"
				>
				</crane-sign-transaction-section>

				<ng-container *ngrxLet="transaction$; let transaction">
					<crane-blockhash-status-section
						#blockhashStatusSection
						*ngrxLet="latestBlockhash$; let latestBlockhash"
						(blockhashChanged)="
							onBlockhashChanged(
								transaction,
								$event.blockhash,
								$event.lastValidBlockHeight
							)
						"
						(blockhashExpired)="onBlockhashExpired(transaction)"
					></crane-blockhash-status-section>
				</ng-container>

				<crane-screwed-card
					class="mt-4 bg-black bp-bg-metal-2 px-6 py-4 rounded flex justify-center"
				>
					<crane-send-transaction-button
						class="flex-1"
						[transaction]="transaction$ | async"
						(transactionSent)="onTransactionSent($event)"
						(transactionFailed)="onTransactionFailed($event)"
					>
					</crane-send-transaction-button>
					<crane-confirm-transaction-button
						class="flex-1"
						[signature]="signature$ | async"
						(transactionConfirmed)="onTransactionConfirmed()"
					>
					</crane-confirm-transaction-button>
				</crane-screwed-card>
			</mat-sidenav>
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
		private readonly _walletStore: WalletStore,
		private readonly _notificationService: NotificationService
	) {}

	ngOnInit() {
		this._walletStore.setAdapters([
			new PhantomWalletAdapter(),
			new SolflareWalletAdapter(),
		]);
		this._connectionStore.setEndpoint('https://api.devnet.solana.com');
	}

	onTransactionCreated(transaction: Option<Transaction>) {
		const newTransaction = new Transaction();

		newTransaction.feePayer = transaction?.feePayer;
		newTransaction.add(...(transaction?.instructions ?? []));

		this._transaction.next(newTransaction);
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
		this._notificationService.notifySuccess('Transaction confirmed!');
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
			newTransaction.recentBlockhash = transaction.recentBlockhash;
			newTransaction.add(...transaction.instructions);

			this._transaction.next(newTransaction);
		}
	}

	onTransactionFailed(error: unknown) {
		if (typeof error === 'string') {
			this._notificationService.notifyError(error);
		} else if (error instanceof Error) {
			console.log(error.message);
			if (error.message.includes('failed to send transaction:')) {
				this._notificationService.notifyError(error.message.split(': ')[2]);
			} else {
				this._notificationService.notifyError(error.message);
			}
		} else {
			console.error(error);
			this._notificationService.notifyError('Unknown error');
		}
	}
}
