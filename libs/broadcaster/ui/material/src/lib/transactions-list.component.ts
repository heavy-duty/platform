import { Component } from '@angular/core';

@Component({
  selector: 'hd-transactions-list',
  template: `
    <div
      class="bg-white bg-opacity-5 mat-elevation-z2 px-2 py-1 mb-4"
      *hdBroadcaster="let transactionStatuses = transactionStatuses"
    >
      <ul
        *ngIf="
          transactionStatuses !== null && transactionStatuses.length > 0;
          else emptyTransactionsList
        "
      >
        <li *ngFor="let transactionStatus of transactionStatuses">
          {{ transactionStatus.signature }} |
          {{ transactionStatus.status }}
        </li>
      </ul>

      <ng-template #emptyTransactionsList>
        <p>There's no transactions.</p>
      </ng-template>
    </div>
  `,
})
export class HdTransactionsListComponent {}
