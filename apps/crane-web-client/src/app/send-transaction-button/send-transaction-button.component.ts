import {
	ChangeDetectionStrategy,
	Component,
	Input,
	Output,
} from '@angular/core';
import { Transaction } from '@solana/web3.js';
import { filter, map } from 'rxjs';
import { isNotNull, Option } from '../utils';
import { SendTransactionButtonStore } from './send-transaction-button.store';

@Component({
	selector: 'crane-send-transaction-button',
	template: `
		<button
			(click)="onSendTransaction()"
			[disabled]="disabled$ | async"
			class="px-4 py-2 border-2 border-blue-300 bg-blue-200 disabled:bg-gray-200 disabled:border-gray-300"
		>
			Send transaction
		</button>
	`,
	providers: [SendTransactionButtonStore],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendTransactionButtonComponent {
	readonly disabled$ = this._sendTransactionButtonStore.disabled$;

	@Input() set transaction(value: Option<Transaction>) {
		console.log(value);

		if (
			value !== null &&
			value.feePayer !== undefined &&
			value.recentBlockhash !== undefined &&
			value.verifySignatures()
		) {
			this._sendTransactionButtonStore.startSending(value);
		}
	}

	@Output() transactionSent =
		this._sendTransactionButtonStore.serviceState$.pipe(
			isNotNull,
			filter(
				(state) => state.matches('Transaction sent') && state.changed === true
			),
			map(({ context }) => context.signature ?? null)
		);

	constructor(
		private readonly _sendTransactionButtonStore: SendTransactionButtonStore
	) {}

	onSendTransaction() {
		this._sendTransactionButtonStore.sendTransaction();
	}
}
