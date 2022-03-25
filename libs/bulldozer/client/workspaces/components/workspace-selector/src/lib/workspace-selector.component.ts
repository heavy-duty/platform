import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
} from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { ConfigStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  WorkspaceApiService,
  WorkspaceStore,
} from '@bulldozer-client/workspaces-data-access';
import { WorkspaceSelectorStore } from './workspace-selector.store';

@Component({
  selector: 'bd-workspace-selector',
  template: `
    <ng-container *ngrxLet="workspace$; let workspace">
      <button type="button" mat-raised-button [matMenuTriggerFor]="menu">
        <div
          class="w-36 flex justify-between gap-2 items-center"
          *ngIf="workspace !== null; else missingWorkspace"
          [matTooltip]="
            workspace.document.name
              | bdItemUpdatingMessage: workspace:'Workspace'
          "
        >
          <span
            class="flex-grow text-left overflow-hidden whitespace-nowrap overflow-ellipsis"
          >
            Workspace: {{ workspace.document.name }}
          </span>
          <mat-progress-spinner
            *ngIf="workspace | bdItemShowSpinner"
            class="flex-shrink-0"
            mode="indeterminate"
            diameter="16"
          ></mat-progress-spinner>
        </div>
        <ng-template #missingWorkspace> Select workspace </ng-template>
      </button>
      <mat-menu #menu="matMenu">
        <div class="px-4 py-2" bdStopPropagation>
          <div
            *ngIf="workspace !== null"
            class="w-full h-auto mb-2 p-4 pb-3 border-b-4 border-transparent bg-white bg-opacity-5 mat-elevation-z2 border-b-primary"
          >
            <div class="w-full">
              <p class="text-xl font-bold mb-0 flex justify-between">
                <span
                  class="flex-grow leading-8"
                  [matTooltip]="workspace.document.name"
                  matTooltipShowDelay="500"
                >
                  {{ workspace.document.name }}
                </span>
                <button
                  mat-icon-button
                  color="primary"
                  class="w-8 h-8 leading-8 flex-shrink-0"
                  [attr.aria-label]="
                    'Download ' + workspace.document.name + ' workspace'
                  "
                  (click)="onDownloadWorkspace(workspace.document.id)"
                >
                  <mat-icon>download</mat-icon>
                </button>
              </p>

              <p class="mb-2">
                <a
                  class="text-xs underline text-primary"
                  [routerLink]="['/workspaces', workspace.document.id]"
                >
                  View details
                </a>
              </p>

              <div>
                <button
                  class="mr-2"
                  type="button"
                  mat-raised-button
                  color="primary"
                  bdEditWorkspaceTrigger
                  [workspace]="workspace.document"
                  (editWorkspace)="
                    onUpdateWorkspace(workspace.document.id, $event)
                  "
                  [disabled]="!connected"
                >
                  Edit
                </button>
                <button
                  type="button"
                  mat-raised-button
                  color="primary"
                  (click)="onDeleteWorkspace(workspace.document.id)"
                  [disabled]="!connected"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <button
            class="w-full h-12 mb-2"
            type="button"
            mat-raised-button
            color="primary"
            bdEditWorkspaceTrigger
            (editWorkspace)="onCreateWorkspace($event)"
            [disabled]="!connected"
          >
            New workspace
          </button>

          <button
            class="w-full h-12"
            type="button"
            mat-raised-button
            color="accent"
            bdImportWorkspaceTrigger
            (importWorkspace)="onImportWorkspace($event)"
          >
            Import workspace
          </button>
        </div>
      </mat-menu>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [WorkspaceStore, WorkspaceSelectorStore],
})
export class WorkspaceSelectorComponent {
  @ViewChild(MatMenu) private _workspaceMenu?: MatMenu;

  @Input() connected = false;

  readonly workspace$ = this._workspaceStore.workspace$;

  constructor(
    private readonly _workspaceSelectorStore: WorkspaceSelectorStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _configStore: ConfigStore,
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _notificationStore: NotificationStore
  ) {}

  private _closeMenu() {
    if (this._workspaceMenu) {
      this._workspaceMenu.closed.emit('click');
    }
  }

  onCreateWorkspace(workspaceName: string) {
    this._closeMenu();
    this._workspaceSelectorStore.createWorkspace(workspaceName);
  }

  onUpdateWorkspace(workspaceId: string, workspaceName: string) {
    this._closeMenu();
    this._workspaceSelectorStore.updateWorkspace({
      workspaceId,
      workspaceName,
    });
  }

  onDeleteWorkspace(workspaceId: string) {
    this._closeMenu();
    this._workspaceSelectorStore.deleteWorkspace(workspaceId);
  }

  onDownloadWorkspace(workspaceId: string) {
    this._closeMenu();
    this._workspaceSelectorStore.downloadWorkspace(workspaceId);
  }

  onActivateWorkspace(workspaceId: string) {
    this._configStore.setWorkspaceId(workspaceId);
  }

  onImportWorkspace(workspaceId: string) {
    this._workspaceApiService.findById(workspaceId).subscribe((workspace) => {
      if (workspace === null) {
        this._notificationStore.setError('Workspace does not exist.');
      } else {
        this._configStore.setWorkspaceId(workspaceId);
      }
    });
  }
}
