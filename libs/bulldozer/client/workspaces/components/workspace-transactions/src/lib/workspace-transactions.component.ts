import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TransactionStatus } from '@heavy-duty/broadcaster';

@Component({
  selector: 'bd-workspace-transactions',
  template: `
    <mat-card class="p-3">
      <section class="flex flex-col gap-3">
        <header bdSectionHeader>
          <h2>Transactions</h2>
          <p>Visualize all the workspace transactions.</p>
        </header>

        <mat-list
          role="list"
          *ngIf="
            transactionStatuses && transactionStatuses.length > 0;
            else emptyList
          "
          class="flex flex-col gap-2"
        >
          <mat-list-item
            role="listitem"
            *ngFor="let transaction of transactionStatuses; let i = index"
            class="h-auto bg-white bg-opacity-5 mat-elevation-z2"
          >
            <div class="flex items-center gap-4 py-2 w-full">
              <div
                class="flex justify-center items-center w-12 h-12 rounded-full bg-black bg-opacity-10 text-xl font-bold"
              >
                {{ i + 1 }}
              </div>
              <div class="flex-grow">
                <h3 class="mb-0 text-lg font-bold">
                  {{ transaction.signature | obscureAddress }}
                </h3>
              </div>
            </div>
          </mat-list-item>
        </mat-list>

        <ng-template #emptyList>
          <p class="text-center text-xl py-8">
            There's no transactions at this time.
          </p>
        </ng-template>
      </section>
    </mat-card>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceTransactionsComponent {
  @Input() transactionStatuses: TransactionStatus[] | null = null;
}
