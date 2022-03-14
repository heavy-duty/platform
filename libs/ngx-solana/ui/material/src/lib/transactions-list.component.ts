import { Component } from '@angular/core';

@Component({
  selector: 'hd-transactions-list',
  template: `
    <ng-container
      *hdSolanaTransactions="let transactionStatuses = transactionStatuses"
    >
      <mat-list
        role="list"
        *ngIf="
          transactionStatuses !== null && transactionStatuses.length > 0;
          else emptyTransactionsList
        "
        class="flex flex-col gap-2"
      >
        <mat-list-item
          role="listitem"
          *ngFor="let transactionStatus of transactionStatuses; let i = index"
          class="h-auto bg-white bg-opacity-5 mat-elevation-z2"
        >
          <div class="flex gap-4">
            <div>status</div>
            <div>
              <div>{{ transactionStatus.status }}</div>

              <div>
                <div>Signature</div>
                <div>{{ transactionStatus.signature }}</div>
              </div>

              <div>
                <div>Fee Costs</div>
                <div>
                  {{ transactionStatus.transactionResponse?.meta?.fee }}
                </div>
              </div>

              <div>
                <div>Movement</div>
                <div
                  *ngIf="transactionStatus.transactionResponse?.meta as meta"
                >
                  {{ meta.postBalances[0] - meta.preBalances[0] }}
                </div>
              </div>
            </div>
          </div>
          TX {{ i }}
        </mat-list-item>
      </mat-list>

      <ng-template #emptyTransactionsList>
        <p class="text-center text-xl py-8">There's no transactions.</p>
      </ng-template>
    </ng-container>
  `,
})
export class HdTransactionsListComponent {}
