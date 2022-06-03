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
			class="bg-black h-full px-6 py-2 bp-button uppercase w-full"
		>
			Send
		</button>
	`,
	providers: [SendTransactionButtonStore],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendTransactionButtonComponent {
	readonly disabled$ = this._sendTransactionButtonStore.disabled$;

	@Input() set transaction(value: Option<Transaction>) {
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
