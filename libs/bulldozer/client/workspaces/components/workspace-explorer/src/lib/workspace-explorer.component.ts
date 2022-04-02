import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ConfigStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { UserStore } from '@bulldozer-client/users-data-access';
import {
  WorkspaceApiService,
  WorkspaceStore,
} from '@bulldozer-client/workspaces-data-access';
import { WorkspaceExplorerStore } from './workspace-explorer.store';

@Component({
  selector: 'bd-workspace-explorer',
  template: `
    <ng-container *ngrxLet="workspace$; let workspace">
      <div class="flex flex-col h-screen">
        <div
          class="flex items-center justify-center border-b hd-border-gray"
          *ngrxLet="user$; let user"
        >
          <button
            class="w-36 mt-5 pb-3"
            bdEditUser
            (editUser)="
              onCreateUser($event.name, $event.userName, $event.thumbnailUrl)
            "
            *ngIf="user === null"
          >
            <figure class="w-20 m-auto mb-2 relative">
              <img
                alt=""
                src="assets/images/default-profile.png"
                class="w-full"
              />
              <img
                alt=""
                src="assets/images/important.png"
                class="w-6 absolute right-0 bottom-0"
              />
            </figure>
            <p class="text-center">Click here to a create new user</p>
          </button>
          <!-- Move to components -->
          <a
            class="w-36 mt-5 pb-3"
            *ngIf="user !== null"
            [routerLink]="['/profile', 'info']"
          >
            <figure class="w-20 mb-2 mx-auto rounded-full overflow-hidden">
              <img
                alt=""
                [src]="user.document.data.thumbnailUrl"
                class="w-full"
              />
            </figure>

            <p
              class="flex items-center justify-center gap-2 mb-0"
              [matTooltip]="
                user.document.data.userName | bdItemUpdatingMessage: user:'User'
              "
              matTooltipShowDelay="500"
            >
              <span>
                {{ user.document.name }}
              </span>
              <mat-progress-spinner
                *ngIf="user | bdItemShowSpinner"
                diameter="16"
                mode="indeterminate"
              ></mat-progress-spinner>
            </p>
            <p class="m-0 text-center">
              <a
                [href]="
                  'https://explorer.solana.com/address/' + user.document.id
                "
                target="__blank"
                class="text-accent underline"
                >@{{ user.document.data.userName }}</a
              >
            </p>
          </a>
        </div>

        <div class="flex-grow border-b hd-border-gray overflow-auto">
          <ng-container *ngIf="workspace !== null">
            <h3 class="ml-4 mt-4 mb-0 flex justify-between items-center">
              <span class="hd-highlight-title uppercase"> Explorer </span>
              <button
                mat-icon-button
                bdEditApplication
                (editApplication)="
                  onCreateApplication(workspace.document.id, $event)
                "
              >
                <mat-icon>add</mat-icon>
              </button>
            </h3>
            <bd-application-explorer
              [connected]="connected"
              [workspaceId]="workspace.document.id"
            ></bd-application-explorer>
          </ng-container>
        </div>

        <div class="w-full pl-4 flex flex-col gap-2">
          <ng-container *ngIf="workspace !== null">
            <h3 class="mt-4 mb-0 hd-highlight-title uppercase">
              Active workspace
            </h3>
            <div class="flex items-center">
              <span
                class="flex-grow overflow-hidden whitespace-nowrap overflow-ellipsis"
              >
                {{ workspace.document.name }}
              </span>
              <button
                mat-icon-button
                (click)="onDownloadWorkspace(workspace.document.id)"
                aria-label="Download workspace"
              >
                <mat-icon inline>download</mat-icon>
              </button>
              <a
                mat-icon-button
                aria-label="View workspace details"
                [routerLink]="['/workspaces', workspace.document.id]"
              >
                <mat-icon inline>open_in_new</mat-icon>
              </a>
            </div>
          </ng-container>

          <div class="py-2 flex justify-around items-center gap-2">
            <figure class="w-8">
              <img src="assets/images/logo.png" class="w-full" />
            </figure>
            <span class="text-center font-bold m-0">BULLDOZER</span>
            <button
              mat-icon-button
              bdAddWorkspace
              (newWorkspace)="onCreateWorkspace($event)"
              (importWorkspace)="onImportWorkspace($event)"
            >
              <mat-icon>add</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [WorkspaceExplorerStore, UserStore, WorkspaceStore],
})
export class WorkspaceExplorerComponent {
  @Input() connected = false;
  @Input() set workspaceId(value: string | null) {
    this._workspaceExplorerStore.setWorkspaceId(value);
  }

  readonly user$ = this._userStore.user$;
  readonly userId$ = this._userStore.userId$;
  readonly workspace$ = this._workspaceStore.workspace$;

  constructor(
    private readonly _workspaceExplorerStore: WorkspaceExplorerStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _userStore: UserStore,
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _configStore: ConfigStore,
    private readonly _notificationStore: NotificationStore
  ) {}

  onCreateUser(name: string, userName: string, thumbnailUrl: string) {
    this._workspaceExplorerStore.createUser({
      name,
      userName,
      thumbnailUrl,
    });
  }

  onDownloadWorkspace(workspaceId: string) {
    this._workspaceExplorerStore.downloadWorkspace(workspaceId);
  }

  onCreateWorkspace(workspaceName: string) {
    this._workspaceExplorerStore.createWorkspace(workspaceName);
  }

  onCreateApplication(workspaceId: string, applicationName: string) {
    this._workspaceExplorerStore.createApplication({
      workspaceId,
      applicationName,
    });
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
