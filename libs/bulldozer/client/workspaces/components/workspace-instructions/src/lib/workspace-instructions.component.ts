import { Component, Input } from '@angular/core';
import { InstructionStatus } from '@bulldozer-client/workspaces-data-access';

@Component({
  selector: 'bd-workspace-instructions',
  template: `
    <mat-card class="p-3">
      <section class="flex flex-col gap-3">
        <header bdSectionHeader>
          <h2>Instructions</h2>
          <p>Visualize all the workspace instructions.</p>
        </header>

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

        <ng-template #emptyList>
          <p class="text-center text-xl py-8">
            There's no instructions at this time.
          </p>
        </ng-template>
      </section>
    </mat-card>
  `,
})
export class WorkspaceInstructionsComponent {
  @Input() instructionStatuses: InstructionStatus[] | null = null;
}
