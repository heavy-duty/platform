import { Component, Input, Output } from '@angular/core';
import { TransactionSignature } from '@solana/web3.js';
import { filter } from 'rxjs';
import { isNotNull } from '../utils';
import { ConfirmTransactionButtonStore } from './confirm-transaction-button.store';

@Component({
	selector: 'crane-confirm-transaction-button',
	template: `
		<button
			(click)="onConfirmTransaction()"
			[disabled]="disabled$ | async"
			class="bg-black h-full px-6 py-2 bp-button uppercase w-full"
		>
			Confirm
		</button>
	`,
	providers: [ConfirmTransactionButtonStore],
})
export class ConfirmTransactionButtonComponent {
	readonly disabled$ = this._confirmTransactionButtonStore.disabled$;

	@Input() set signature(value: TransactionSignature | null) {
		if (value !== null) {
			this._confirmTransactionButtonStore.startConfirming(value);
		}
	}

	@Output() transactionConfirmed =
		this._confirmTransactionButtonStore.serviceState$.pipe(
			isNotNull,
			filter(
				(state) =>
					state.matches('Transaction confirmed') && state.changed === true
			)
		);

	constructor(
		private readonly _confirmTransactionButtonStore: ConfirmTransactionButtonStore
	) {}

	onConfirmTransaction() {
		this._confirmTransactionButtonStore.confirmTransaction();
	}
}
