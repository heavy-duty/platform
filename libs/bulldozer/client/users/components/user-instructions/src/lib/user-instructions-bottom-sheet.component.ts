import { Component, HostBinding, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { InstructionStatus } from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import { interval, map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'bd-user-instructions-bottom-sheet',
  template: `
    <ng-container *ngIf="instructionStatuses$ !== null">
      <ng-container
        *ngIf="instructionStatuses$ | ngrxPush as instructionStatuses"
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
              *ngFor="
                let instructionStatus of instructionStatuses;
                let i = index
              "
            >
              <div class="w-full h-8 flex items-center gap-4">
                <div>
                  <mat-progress-spinner
                    *ngIf="
                      instructionStatus.transactionStatus.status !== 'finalized'
                    "
                    color="accent"
                    diameter="16"
                    mode="indeterminate"
                  >
                  </mat-progress-spinner>

                  <mat-icon
                    *ngIf="
                      instructionStatus.transactionStatus.status === 'finalized'
                    "
                    class="text-green-500"
                    inline
                    >check_circle</mat-icon
                  >
                </div>

                <p class="flex-1 m-0">
                  {{ instructionStatus.title }}
                </p>

                <ng-container *ngrxLet="timeNow$; let timeNow">
                  <p
                    *ngIf="
                      instructionStatus.transactionStatus.timestamp !==
                      undefined
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
    </ng-container>
  `,
})
export class UserInstructionsBottomSheetComponent {
  @HostBinding('class') class = 'block py-4';
  readonly instructionStatuses$: Observable<List<InstructionStatus>> | null;
  readonly timeNow$ = interval(60 * 1000).pipe(
    startWith(Date.now()),
    map(() => Date.now())
  );

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA)
    data: Observable<List<InstructionStatus>>
  ) {
    this.instructionStatuses$ = data;
  }
}
