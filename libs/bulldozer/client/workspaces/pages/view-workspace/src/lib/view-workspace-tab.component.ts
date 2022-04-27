import { Component, HostBinding, Input } from '@angular/core';
import { TabStore } from '@bulldozer-client/core-data-access';
import { WorkspaceStore } from '@bulldozer-client/workspaces-data-access';
import { ViewWorkspaceStore } from './view-workspace.store';

@Component({
  selector: 'bd-view-workspace-tab',
  template: `
    <div
      *ngIf="workspaceId$ | ngrxPush as workspaceId"
      class="flex items-center p-0"
    >
      <div
        *ngIf="(loading$ | ngrxPush) === false; else loading"
        class="w-40 h-10 flex items-center"
      >
        <a
          [routerLink]="url"
          class="w-full h-full flex justify-between gap-2 items-center pl-4 flex-grow"
        >
          <ng-container
            *ngIf="workspace$ | ngrxPush as workspace; else notFound"
          >
            <span
              class="flex-grow text-left overflow-hidden whitespace-nowrap overflow-ellipsis"
              [matTooltip]="
                workspace.name | bdItemUpdatingMessage: workspace:'Workspace'
              "
              matTooltipShowDelay="500"
            >
              {{ workspace.name }}
            </span>

            <span
              hdProgressSpinner
              *ngIf="workspace | bdItemChanging"
              class="flex-shrink-0 h-4 w-4 border-4 border-accent"
            ></span>
          </ng-container>

          <ng-template #notFound>
            <span class="m-0 pl-4">Not found</span>
          </ng-template>
        </a>
      </div>

      <ng-template #loading>
        <p class="w-full h-1/2 m-0 bg-white bg-opacity-10 animate-pulse"></p>
      </ng-template>

      <button
        mat-icon-button
        [attr.aria-label]="'Close ' + workspaceId + ' tab'"
        (click)="onCloseTab(workspaceId)"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  providers: [WorkspaceStore, ViewWorkspaceStore],
})
export class ViewWorkspaceTabComponent {
  @HostBinding('class') class = 'block w-full';

  @Input() url: string | null = null;
  @Input() set workspaceId(value: string) {
    this._viewWorkspaceStore.setWorkspaceId(value);
  }

  readonly workspaceId$ = this._viewWorkspaceStore.workspaceId$;
  readonly workspace$ = this._viewWorkspaceStore.workspace$;
  readonly loading$ = this._workspaceStore.loading$;

  constructor(
    private readonly _tabStore: TabStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _viewWorkspaceStore: ViewWorkspaceStore
  ) {}

  onCloseTab(workspaceId: string) {
    this._tabStore.closeTab(workspaceId);
  }
}
