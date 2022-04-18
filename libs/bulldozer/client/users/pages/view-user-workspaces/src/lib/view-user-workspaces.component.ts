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
        <mat-card
          *ngFor="let workspace of workspaces; let i = index"
          class="h-auto w-96 rounded-lg overflow-hidden bd-bg-image-1 p-0 mat-elevation-z8"
        >
          <aside class="flex items-center bd-bg-black px-4 py-1 gap-1">
            <div class="flex-1 flex items-center gap-2">
              <ng-container *ngIf="workspace | bdItemChanging">
                <mat-progress-spinner
                  diameter="20"
                  mode="indeterminate"
                ></mat-progress-spinner>

                <p class="m-0 text-xs text-white text-opacity-60">
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
              </ng-container>
            </div>
            <a
              [attr.aria-label]="'View ' + workspace.name"
              [routerLink]="['/workspaces', workspace.id]"
              mat-icon-button
            >
              <mat-icon>open_in_new</mat-icon>
            </a>
            <div *hdWalletAdapter="let publicKey = publicKey">
              <button
                *ngIf="publicKey !== null"
                mat-icon-button
                [attr.aria-label]="'Delete ' + workspace.name"
                (click)="onDeleteWorkspace(publicKey.toBase58(), workspace.id)"
                [disabled]="
                  (connected$ | ngrxPush) === false ||
                  (workspace | bdItemChanging)
                "
              >
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </aside>

          <div class="px-8 mt-4">
            <header class="flex items-center">
              <div class="flex-1">
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

                <p *ngIf="workspaceId$ | ngrxPush as workspaceId">
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
              <div
                class="py-2 px-5 w-32 h-12 bd-bg-image-11 shadow flex justify-center items-center m-auto mt-4 mb-4 relative bg-bd-black"
              >
                <button
                  class="bd-button"
                  (click)="onActivateWorkspace(workspace.id)"
                >
                  Activate
                </button>
                <div
                  class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-5 left-2"
                >
                  <div class="w-full h-px bg-gray-600 rotate-45"></div>
                </div>
                <div
                  class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-5 right-2"
                >
                  <div class="w-full h-px bg-gray-600 rotate-12"></div>
                </div>
              </div>
            </header>

            <section class="mt-5">
              <p class="mb-0 font-bold">Workspace ID:</p>
              <div
                class="bd-bg-black px-5 py-3 flex justify-between items-center rounded-md mt-1 mb-8"
              >
                <span>
                  {{ workspace.id | obscureAddress: '.':[13, 33] }}
                </span>
                <mat-icon
                  class="cursor-pointer"
                  [cdkCopyToClipboard]="workspace.id"
                  >content_copy</mat-icon
                >
              </div>
            </section>
          </div>
        </mat-card>
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
