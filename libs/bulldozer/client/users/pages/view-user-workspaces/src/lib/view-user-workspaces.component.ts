import { Component, HostBinding, OnInit } from '@angular/core';
import { ConfigStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  WorkspaceApiService,
  WorkspaceQueryStore,
  WorkspacesStore,
} from '@bulldozer-client/workspaces-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { map } from 'rxjs';
import { ViewUserWorkspacesStore } from './view-user-workspaces.store';

@Component({
  selector: 'bd-view-user-workspaces',
  template: `
    <header class="mb-8">
      <h1 class="text-4xl uppercase mb-1 bd-font">Workspaces</h1>
      <p class="text-sm font-thin mb-0">List of all your workspaces.</p>
    </header>

    <ng-container *ngIf="workspaces$ | ngrxPush as workspaces">
      <div
        *ngIf="workspaces && workspaces.size > 0; else emptyList"
        class="flex gap-6 flex-wrap"
      >
        <div
          class="flex flex-col gap-2 bd-bg-image-5 bg-bd-black px-4 py-5 rounded mat-elevation-z8"
          *ngFor="let workspace of workspaces; let i = index"
        >
          <ng-container *ngIf="workspaceId$ | ngrxPush as workspaceId">
            <div class="flex gap-2">
              <bd-card class="flex-1">
                <div class="flex items-center gap-2 ">
                  <figure
                    class="flex justify-center items-center w-20 h-20 rounded-full overflow-hidden bg-bd-black"
                    *ngIf="!(workspace | bdItemChanging)"
                  >
                    <img
                      src="assets/icons/view-profile-icon.png"
                      onerror="this.src='assets/images/default-profile.png';"
                    />
                  </figure>
                  <div
                    *ngIf="workspace | bdItemChanging"
                    class="flex justify-center items-center w-20 h-20 rounded-full overflow-hidden bg-bd-black"
                  >
                    <mat-progress-spinner
                      diameter="48"
                      mode="indeterminate"
                    ></mat-progress-spinner>

                    <p class="m-0 text-xs text-white text-opacity-60 absolute">
                      <ng-container *ngIf="workspace.isCreating">
                        Creating...
                      </ng-container>
                      <ng-container *ngIf="workspace.isUpdating">
                        Updating...
                      </ng-container>
                      <ng-container *ngIf="workspace.isDeleting">
                        Deleting...
                      </ng-container>
                    </p>
                  </div>
                  <div>
                    <h2
                      class="mb-0 text-lg font-bold flex justify-start"
                      [matTooltip]="
                        workspace.name
                          | bdItemUpdatingMessage: workspace:'Workspace'
                      "
                      matTooltipShowDelay="500"
                    >
                      {{ workspace.name }}
                    </h2>

                    <p>
                      <span
                        class="w-2 h-2 rounded-full mr-2 mt-1 inline-block"
                        [ngClass]="
                          workspaceId === workspace.id
                            ? 'bg-green-500'
                            : 'bg-yellow-500'
                        "
                      ></span>
                      <span class="font-thin">{{
                        workspaceId === workspace.id ? 'Active' : 'Inactive'
                      }}</span>
                    </p>
                  </div>
                </div>
              </bd-card>
              <bd-card class="flex flex-col justify-center">
                <a
                  [attr.aria-label]="'View ' + workspace.name"
                  [routerLink]="['/workspaces', workspace.id]"
                  class="bd-button w-28"
                >
                  View details
                </a>
                <ng-container *hdWalletAdapter="let publicKey = publicKey">
                  <button
                    class="bd-button w-28"
                    *ngIf="publicKey !== null"
                    [attr.aria-label]="'Delete ' + workspace.name"
                    (click)="
                      onDeleteWorkspace(publicKey.toBase58(), workspace.id)
                    "
                    [disabled]="
                      (connected$ | ngrxPush) === false ||
                      (workspace | bdItemChanging)
                    "
                  >
                    Delete
                  </button>
                </ng-container>
              </bd-card>
            </div>
            <bd-card>
              <dl class="flex justify-between gap-5">
                <div class="flex-1">
                  <dt class="mb-2">Workspace ID:</dt>
                  <dd
                    class="flex justify-between items-center h-10 gap-1 px-2 bg-bd-black bg-opacity-70 rounded-md"
                  >
                    <span>
                      {{ workspace.id | obscureAddress: '.':[13, 33] }}
                    </span>
                    <mat-icon
                      class="cursor-pointer"
                      [cdkCopyToClipboard]="workspace.id"
                      >content_copy</mat-icon
                    >
                  </dd>
                </div>
                <button
                  class="bd-button self-end mb-1"
                  (click)="onActivateWorkspace(workspace.id)"
                  *ngIf="workspaceId !== workspace.id"
                >
                  Activate
                </button>
              </dl>
            </bd-card>
          </ng-container>
        </div>
      </div>

      <ng-template #emptyList>
        <p class="text-center text-xl py-8">You don't have workspaces.</p>
      </ng-template>
    </ng-container>
  `,
  styles: [],
  providers: [WorkspacesStore, WorkspaceQueryStore, ViewUserWorkspacesStore],
})
export class ViewUserWorkspacesComponent implements OnInit {
  @HostBinding('class') class = 'block p-8 pt-5';
  readonly connected$ = this._walletStore.connected$;
  readonly workspaces$ = this._viewUserWorkspacesStore.workspaces$;
  readonly workspaceId$ = this._configStore.workspaceId$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _workspacesStore: WorkspacesStore,
    private readonly _configStore: ConfigStore,
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _notificationStore: NotificationStore,
    private readonly _viewUserWorkspacesStore: ViewUserWorkspacesStore
  ) {}

  ngOnInit() {
    this._viewUserWorkspacesStore.setAuthority(
      this._walletStore.publicKey$.pipe(
        isNotNullOrUndefined,
        map((publicKey) => publicKey.toBase58())
      )
    );
  }

  onActivateWorkspace(workspaceId: string) {
    this._configStore.setWorkspaceId(workspaceId);
  }

  onDeleteWorkspace(authority: string, workspaceId: string) {
    this._workspaceApiService
      .delete({
        authority,
        workspaceId,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Delete workspace request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `workspace:${workspaceId}`,
                  `authority:${authority}`,
                ],
              },
            })
          );
        },
        error: (error) => {
          this._notificationStore.setError(error);
        },
      });
  }
}
