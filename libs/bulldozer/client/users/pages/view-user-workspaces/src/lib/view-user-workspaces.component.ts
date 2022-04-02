import { Component, HostBinding } from '@angular/core';
import { ConfigStore } from '@bulldozer-client/core-data-access';
import {
  WorkspaceQueryStore,
  WorkspacesStore,
} from '@bulldozer-client/workspaces-data-access';
import { ViewUserWorkspacesStore } from './view-user-workspaces.store';

@Component({
  selector: 'bd-view-user-workspaces',
  template: `
    <header>
      <h1 class="uppercase">Workspaces</h1>
      <p>List of all your workspaces.</p>
    </header>
    <ng-container *ngIf="workspaces$ | ngrxPush as workspaces">
      <div
        *ngIf="workspaces && workspaces.length > 0; else emptyList"
        class="flex gap-6 flex-wrap mt-4"
      >
        <mat-card
          *ngFor="let workspace of workspaces; let i = index"
          class="h-auto w-96 rounded-lg overflow-hidden bd-bg-image-1 p-0"
        >
          <aside class="flex justify-end bd-bg-black px-4 py-1 gap-1">
            <a
              [attr.aria-label]="'View ' + workspace.document.name"
              [routerLink]="['/workspaces', workspace.document.id]"
              mat-icon-button
            >
              <mat-icon>open_in_new</mat-icon>
            </a>
            <button
              mat-icon-button
              [attr.aria-label]="'Delete ' + workspace.document.name"
              (click)="onDeleteWorkspace(workspace.document.id)"
            >
              <mat-icon>delete</mat-icon>
            </button>
          </aside>

          <div class="px-8 mt-4">
            <header>
              <h2
                class="mb-0 text-lg font-bold flex justify-start"
                [matTooltip]="
                  workspace.document.name
                    | bdItemUpdatingMessage: workspace:'Workspace'
                "
                matTooltipShowDelay="500"
              >
                {{ workspace.document.name }}
              </h2>
              <p *ngIf="workspaceId$ | ngrxPush as workspaceId">
                <span
                  class="w-2 h-2 rounded-full mr-2 mt-1 inline-block"
                  [ngClass]="
                    workspaceId === workspace.document.id
                      ? 'bg-green-500'
                      : 'bg-yellow-500'
                  "
                ></span>
                <span class="font-thin">{{
                  workspaceId === workspace.document.id ? 'Active' : 'Inactive'
                }}</span>
              </p>
            </header>

            <section class="mt-5">
              <p class="mb-0 font-bold">Workspace ID:</p>
              <div
                class="bd-bg-black px-5 py-3 flex justify-between items-center rounded-md mt-1 mb-8"
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
export class ViewUserWorkspacesComponent {
  @HostBinding('class') class = 'block p-8';
  readonly workspaces$ = this._workspacesStore.workspaces$;
  readonly workspaceId$ = this._configStore.workspaceId$;

  constructor(
    private readonly _workspacesStore: WorkspacesStore,
    private readonly _configStore: ConfigStore,
    private readonly _viewUserWorkspacesStore: ViewUserWorkspacesStore
  ) {}

  onActivateWorkspace(workspaceId: string) {
    this._configStore.setWorkspaceId(workspaceId);
  }

  onDeleteWorkspace(workspaceId: string) {
    this._viewUserWorkspacesStore.deleteWorkspace(workspaceId);
  }
}
