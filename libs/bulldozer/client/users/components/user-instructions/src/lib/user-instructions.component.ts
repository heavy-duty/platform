import { Component, HostBinding } from '@angular/core';
import { interval, map, startWith } from 'rxjs';

@Component({
  selector: 'bd-user-instructions',
  template: `
    <ng-container
      *bdUserInstructionsStore="let instructionStatuses = instructionStatuses"
    >
      <header>
        <h1 class="text-center text-2xl">Instructions</h1>
      </header>

      <main>
        <mat-list
          role="list"
          *ngIf="
            instructionStatuses !== null && instructionStatuses.size > 0;
            else emptyTransactionsList
          "
          class="flex flex-col gap-2"
        >
          <mat-list-item
            role="listitem"
            *ngFor="let instructionStatus of instructionStatuses; let i = index"
          >
            <div class="w-full h-8 flex items-center gap-4">
              <div
                hdProgressSpinner
                *ngIf="
                  instructionStatus.transactionStatus.status !== 'finalized'
                "
                class="h-4 w-4 border-4 border-accent"
              ></div>

              <mat-icon
                *ngIf="
                  instructionStatus.transactionStatus.status === 'finalized'
                "
                class="inline-block h-4 w-4 text-green-500"
                inline
                >check_circle</mat-icon
              >

              <p class="flex-1 m-0">
                {{ instructionStatus.title }}
              </p>

              <ng-container *ngrxLet="timeNow$; let timeNow">
                <p
                  *ngIf="
                    instructionStatus.transactionStatus.timestamp !== undefined
                  "
                  class="text-xs m-0 text-white text-opacity-50"
                >
                  {{
                    timeNow - instructionStatus.transactionStatus.timestamp
                      | bdRelativeTime: true
                  }}
                </p>
              </ng-container>
            </div>
          </mat-list-item>
        </mat-list>

        <ng-template #emptyTransactionsList>
          <p class="text-center text-xl py-8">There's no instructions.</p>
        </ng-template>
      </main>
    </ng-container>
  `,
})
export class UserInstructionsComponent {
  @HostBinding('class') class = 'block py-4';
  readonly timeNow$ = interval(60 * 1000).pipe(
    startWith(Date.now()),
    map(() => Date.now())
  );
}
