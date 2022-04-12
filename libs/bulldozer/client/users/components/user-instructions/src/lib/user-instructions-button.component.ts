import { Component, Input } from '@angular/core';
import { interval, map, startWith } from 'rxjs';

@Component({
  selector: 'bd-user-instructions-button',
  template: `
    <ng-container
      *bdUserInstructionsStore="
        let instructionStatuses = instructionStatuses;
        let instructionNotViewedStatuses = instructionNotViewedStatuses;
        let instructionInProcessStatuses = instructionInProcessStatuses;
        let markAsViewed = markAsViewed
      "
    >
      <ng-container
        *ngIf="
          instructionNotViewedStatuses !== null &&
          instructionInProcessStatuses !== null &&
          markAsViewed
        "
      >
        <div
          class="inline-block relative"
          *ngIf="
            instructionNotViewedStatuses.size === 0 ||
            instructionInProcessStatuses.size > 0
          "
        >
          <button
            type="button"
            mat-icon-button
            [matMenuTriggerFor]="menu"
            (menuClosed)="markAsViewed()"
            class="z-10"
          >
            <mat-icon>notifications</mat-icon>
          </button>
          <mat-progress-spinner
            *ngIf="instructionInProcessStatuses.size > 0"
            color="accent"
            mode="indeterminate"
            diameter="44"
            class="absolute z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
          </mat-progress-spinner>
        </div>

        <button
          *ngIf="
            instructionNotViewedStatuses.size > 0 &&
            instructionInProcessStatuses.size === 0
          "
          type="button"
          class="rounded-full w-8 h-8 border-2 border-green-500"
          [matMenuTriggerFor]="menu"
          (menuClosed)="markAsViewed()"
        >
          {{ instructionNotViewedStatuses.size }}
        </button>
      </ng-container>

      <mat-menu #menu="matMenu">
        <div class="w-80 h-auto px-4 py-2 flex flex-col gap-2">
          <header class="py-2">
            <h1 class="m-0 text-lg text-center font-bold">Instructions</h1>
          </header>

          <main>
            <ul
              *ngIf="
                instructionNotViewedStatuses &&
                  instructionNotViewedStatuses.size > 0;
                else emptyInstructions
              "
            >
              <li
                *ngFor="let instructionStatus of instructionNotViewedStatuses"
                class="w-full h-8 flex items-center gap-4"
              >
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

                <p
                  class="flex-1 m-0 overflow-hidden whitespace-nowrap overflow-ellipsis"
                  [matTooltip]="instructionStatus.title"
                  matTooltipShowDelay="500"
                >
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
              </li>
            </ul>

            <ng-template #emptyInstructions>
              <p class="text-center m-0">There's no pending instructions.</p>
            </ng-template>
          </main>

          <footer class="py-2 flex justify-center">
            <button
              bdUserInstructionsBottomSheet
              class="text-underline text-accent"
            >
              See more
            </button>
          </footer>
        </div>
      </mat-menu>
    </ng-container>
  `,
})
export class UserInstructionsButtonComponent {
  @Input() color = 'primary';
  readonly timeNow$ = interval(60 * 1000).pipe(
    startWith(Date.now()),
    map(() => Date.now())
  );
}
