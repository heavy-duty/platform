import { Component } from '@angular/core';

@Component({
  selector: 'bd-user-instructions',
  template: `
    <ng-container
      *bdUserInstructionsStore="let instructionStatuses = instructionStatuses"
    >
      <mat-list
        role="list"
        *ngIf="
          instructionStatuses !== null && instructionStatuses.length > 0;
          else emptyTransactionsList
        "
        class="flex flex-col gap-2"
      >
        <mat-list-item
          role="listitem"
          *ngFor="let instructionStatus of instructionStatuses; let i = index"
          class="h-12"
        >
          <div
            class="w-full h-full px-4 bg-white bg-opacity-5 flex justify-between items-center"
          >
            {{ instructionStatus.title }}

            <mat-progress-spinner
              *ngIf="instructionStatus.status !== 'finalized'"
              diameter="24"
              mode="indeterminate"
              color="primary"
            >
            </mat-progress-spinner>
          </div>
        </mat-list-item>
      </mat-list>

      <ng-template #emptyTransactionsList>
        <p class="text-center text-xl py-8">There's no instructions.</p>
      </ng-template>
    </ng-container>
  `,
})
export class UserInstructionsComponent {}
