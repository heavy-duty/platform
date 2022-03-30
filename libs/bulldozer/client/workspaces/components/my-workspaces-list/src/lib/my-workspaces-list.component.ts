import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { WorkspaceView } from '@bulldozer-client/workspaces-data-access';

@Component({
  selector: 'bd-my-workspaces-list',
  template: `
    <div
      *ngIf="workspaces && workspaces.length > 0; else emptyList"
      class="flex gap-6 flex-wrap"
    >
      <mat-card
        *ngFor="let workspace of workspaces; let i = index"
        class="h-auto bg-white bg-opacity-5 mat-elevation-z2 w-96"
      >
        <div class="flex py-2 gap-2">
          <div
            class="flex justify-center items-center w-12 h-12 rounded-full bg-black bg-opacity-10 text-xl font-bold"
          >
            {{ i + 1 }}
          </div>
          <div class="flex-grow">
            <h3 class="mb-0 text-lg font-bold flex justify-start">
              <span
                [matTooltip]="
                  workspace.document.name
                    | bdItemUpdatingMessage: workspace:'Workspace'
                "
                matTooltipShowDelay="500"
              >
                {{ workspace.document.name }}
              </span>
            </h3>
            <div class="flex">
              <div
                class="hd-active-status mr-2 mt-1"
                [ngClass]="{
                  active: activeWorkspaceId === workspace.document.id
                }"
              ></div>
              <small>{{
                activeWorkspaceId === workspace.document.id
                  ? 'Active'
                  : 'Inactive'
              }}</small>
            </div>
          </div>
          <button
            mat-icon-button
            [attr.aria-label]="
              'More options of ' + workspace.document.name + ' application'
            "
            [matMenuTriggerFor]="myWorkspaceListItemMenu"
            bdStopPropagation
          >
            <mat-icon>more_horiz</mat-icon>
          </button>
        </div>
        <div>
          <div class="mt-5">
            <p class="mb-0 font-bold">Workspace ID:</p>
            <div
              class="hd-dark-container px-5 py-3 flex justify-between items-center rounded-md mt-3 mb-3"
            >
              <span>
                {{ workspace.document.id | obscureAddress: '.':[13, 33] }}
              </span>
              <mat-icon
                class="cursor-pointer"
                [cdkCopyToClipboard]="workspace.document.id"
                >content_copy</mat-icon
              >
            </div>
          </div>
        </div>

        <mat-menu #myWorkspaceListItemMenu="matMenu" class="w-full px-5">
          <button
            class="w-full h-12 flex items-center"
            aria-label="View workspace detail"
            color="primary"
            [routerLink]="['/workspaces', workspace.document.id]"
          >
            <mat-icon class="mr-3">open_in_new</mat-icon>
            <span>View details</span>
          </button>
          <button
            class="w-full h-12 flex items-center"
            aria-label="Delete workspace"
            color="primary"
            (click)="onDeleteWorkspace(workspace.document.id)"
          >
            <mat-icon class="mr-3">delete</mat-icon>
            <span>Delete</span>
          </button>
        </mat-menu>
      </mat-card>
    </div>

    <ng-template #emptyList>
      <p class="text-center text-xl py-8">You don't have workspaces.</p>
    </ng-template>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyWorkspacesListComponent {
  @Input() workspaces: WorkspaceView[] | null = null;
  @Input() activeWorkspaceId: string | null = null;
  @Output() activateWorkspace = new EventEmitter<string>();
  @Output() deleteWorkspace = new EventEmitter<string>();

  onActivateWorkspace(workspaceId: string) {
    this.activateWorkspace.emit(workspaceId);
  }

  onDeleteWorkspace(workspaceId: string) {
    this.deleteWorkspace.emit(workspaceId);
  }
}
