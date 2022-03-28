import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
} from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { ApplicationsStore } from '@bulldozer-client/applications-data-access';
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
      <button type="button" mat-mini-fab [matMenuTriggerFor]="menu">
        <mat-icon aria-label="Add new workspace">add</mat-icon>
      </button>
      <mat-menu #menu="matMenu">
        <div
          *ngIf="workspace !== null"
          class="w-full h-auto mb-2 p-4 pb-3 border-b-4 border-transparent bg-white bg-opacity-5 mat-elevation-z2 border-b-primary"
        >
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
              (click)="onActivateWorkspace(workspace.document.id)"
            >
              View details
            </a>
          </p>
        </div>

        <button
          class="w-full h-12"
          type="button"
          mat-menu-item
          color="primary"
          *ngIf="workspaceId$ | ngrxPush as workspaceId"
          [disabled]="!connected"
          [matMenuTriggerFor]="applications"
        >
          <mat-icon>apps</mat-icon>
          <span>Applications</span>
        </button>

        <button
          class="w-full h-12"
          type="button"
          mat-menu-item
          color="accent"
          [matMenuTriggerFor]="workspaces"
        >
          <mat-icon>apartment</mat-icon>
          <span>Workspaces</span>
        </button>
      </mat-menu>

      <mat-menu #applications="matMenu">
        <button
          mat-menu-item
          class="w-full h-12"
          [disabled]="!connected"
          *ngIf="workspaceId$ | ngrxPush as workspaceId"
          bdEditApplicationTrigger
          (editApplication)="onCreateApplication(workspaceId, $event)"
        >
          <mat-icon>add_circle_outline</mat-icon>
          <span>Create new application</span>
        </button>
      </mat-menu>

      <mat-menu #workspaces="matMenu">
        <button
          class="w-full h-12"
          mat-menu-item
          bdEditWorkspaceTrigger
          (editWorkspace)="onCreateWorkspace($event)"
        >
          <mat-icon>add_circle_outline</mat-icon>
          <span>Create new workspace</span>
        </button>
        <button
          class="w-full h-12"
          mat-menu-item
          bdImportWorkspaceTrigger
          (importWorkspace)="onImportWorkspace($event)"
        >
          <mat-icon>upload</mat-icon>
          <span>Import workspace</span>
        </button>
      </mat-menu>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [WorkspaceSelectorStore, ApplicationsStore],
})
export class WorkspaceSelectorComponent {
  @ViewChild(MatMenu) private _workspaceMenu?: MatMenu;

  @Input() connected = false;

  readonly workspace$ = this._workspaceStore.workspace$;
  readonly workspaceId$ = this._workspaceStore.workspaceId$;

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
    this._closeMenu();
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

  onCreateApplication(workspaceId: string, applicationName: string) {
    this._workspaceSelectorStore.createApplication({
      workspaceId,
      applicationName,
    });
  }
}
