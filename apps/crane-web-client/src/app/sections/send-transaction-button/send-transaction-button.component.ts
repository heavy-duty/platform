import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	inject,
	Input,
	Output,
} from '@angular/core';
import { BlueprintButtonComponent } from '@heavy-duty/blueprint-button';
import { Transaction } from '@solana/web3.js';
import { filter, map } from 'rxjs';
import { isNotNull, Option } from '../../utils';
import { SendTransactionButtonStore } from './send-transaction-button.store';

@Component({
	selector: 'crane-send-transaction-button',
	template: `
		<button
			class="w-full h-full"
			[disabled]="disabled$ | async"
			(click)="onSendTransaction()"
			bpButton
		>
			Send
		</button>
	`,
	providers: [SendTransactionButtonStore],
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [CommonModule, BlueprintButtonComponent],
})
export class SendTransactionButtonComponent {
	private readonly _sendTransactionButtonStore = inject(
		SendTransactionButtonStore
	);

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
	@Output() transactionFailed =
		this._sendTransactionButtonStore.serviceState$.pipe(
			isNotNull,
			filter(
				(state) => state.matches('Transaction failed') && state.changed === true
			),
			map(({ context }) => context.error ?? null)
		);

	onSendTransaction() {
		this._sendTransactionButtonStore.sendTransaction();
	}
}
