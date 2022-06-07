import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	Input,
	Output,
} from '@angular/core';
import { BlueprintButtonComponent } from '@heavy-duty/blueprint-button';
import { TransactionSignature } from '@solana/web3.js';
import { filter } from 'rxjs';
import { isNotNull } from '../../utils';
import { ConfirmTransactionButtonStore } from './confirm-transaction-button.store';

@Component({
	selector: 'crane-confirm-transaction-button',
	template: `
		<button
			class="w-full h-full"
			[disabled]="disabled$ | async"
			(click)="onConfirmTransaction()"
			bpButton
		>
			Confirm
		</button>
	`,
	providers: [ConfirmTransactionButtonStore],
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [CommonModule, BlueprintButtonComponent],
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
