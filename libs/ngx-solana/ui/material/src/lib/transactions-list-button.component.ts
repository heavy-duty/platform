import { Component, Input } from '@angular/core';

@Component({
  selector: 'hd-transactions-list-button',
  template: `
    <ng-container
      *hdSolanaTransactions="let transactionsInProcess = transactionsInProcess"
    >
      <button
        type="button"
        mat-raised-button
        hdTransactionsList
        *ngIf="showEmpty || transactionsInProcess > 0"
      >
        <div class="flex justify-between items-center gap-2">
          <span> Transactions in Process ({{ transactionsInProcess }}) </span>
          <mat-progress-spinner
            diameter="16"
            mode="indeterminate"
            [color]="color"
          >
          </mat-progress-spinner>
        </div>
      </button>
    </ng-container>
  `,
})
export class HdTransactionsListButtonComponent {
  @Input() color = 'primary';
  @Input() showEmpty = false;
}
