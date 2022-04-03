import { Component, HostBinding } from '@angular/core';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { interval, map, startWith } from 'rxjs';

@Component({
  selector: 'bd-view-workspace-instructions',
  template: `
    <header class="mb-8 border-b-2 border-yellow-500">
      <h1 class="text-2xl uppercase mb-1">Instructions</h1>
      <p class="text-sm font-thin mb-2">
        List of the last instructions executed for this workspace.
      </p>
    </header>

    <main *ngrxLet="instructionStatuses$; let instructionStatuses">
      <mat-list
        role="list"
        *ngIf="
          instructionStatuses !== null && instructionStatuses.length > 0;
          else emptyList
        "
        class="flex flex-col gap-2"
      >
        <mat-list-item
          role="listitem"
          *ngFor="let instructionStatus of instructionStatuses; let i = index"
        >
          <div class="w-full h-8 flex items-center gap-4">
            <div>
              <mat-progress-spinner
                *ngIf="instructionStatus.status !== 'finalized'"
                color="accent"
                diameter="16"
                mode="indeterminate"
              >
              </mat-progress-spinner>

              <mat-icon
                *ngIf="instructionStatus.status === 'finalized'"
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
                *ngIf="instructionStatus.confirmedAt !== undefined"
                class="text-xs m-0 text-white text-opacity-50"
              >
                {{
                  timeNow - instructionStatus.confirmedAt | bdRelativeTime: true
                }}
              </p>
            </ng-container>
          </div>
        </mat-list-item>
      </mat-list>

      <ng-template #emptyList>
        <p class="text-center text-xl py-8">
          There's no instructions at this time.
        </p>
      </ng-template>
    </main>
  `,
  styles: [],
})
export class ViewWorkspaceInstructionsComponent {
  @HostBinding('class') class = 'block p-8 bg-white bg-opacity-5 h-full';
  readonly instructionStatuses$ =
    this._workspaceInstructionsStore.instructionStatuses$;
  readonly timeNow$ = interval(60 * 1000).pipe(
    startWith(Date.now()),
    map(() => Date.now())
  );

  constructor(
    private readonly _workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {}
}
