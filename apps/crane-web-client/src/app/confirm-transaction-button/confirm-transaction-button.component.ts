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
      class="px-4 py-2 border-2 border-blue-300 bg-blue-200 disabled:bg-gray-200 disabled:border-gray-300"
    >
      Confirm transaction
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
