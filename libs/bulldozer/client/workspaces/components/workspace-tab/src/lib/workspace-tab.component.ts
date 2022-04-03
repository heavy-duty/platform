import { Component, HostBinding, Input } from '@angular/core';
import { TabStore } from '@bulldozer-client/core-data-access';
import { WorkspaceStore } from '@bulldozer-client/workspaces-data-access';
import { WorkspaceTabStore } from './workspace-tab.store';

@Component({
  selector: 'bd-workspace-tab',
  template: `
    <div
      *ngIf="workspace$ | ngrxPush as workspace"
      class="flex items-center p-0"
    >
      <a
        [routerLink]="['/workspaces', workspace.document.id]"
        class="w-40 h-12 flex justify-between gap-2 items-center pl-4 flex-grow"
        [matTooltip]="
          workspace.document.name | bdItemUpdatingMessage: workspace:'Workspace'
        "
        matTooltipShowDelay="500"
      >
        <span
          class="flex-grow text-left overflow-hidden whitespace-nowrap overflow-ellipsis"
        >
          {{ workspace.document.name }}
        </span>
        <mat-progress-spinner
          *ngIf="workspace | bdItemShowSpinner"
          class="flex-shrink-0"
          mode="indeterminate"
          diameter="16"
        ></mat-progress-spinner>
      </a>
      <button
        mat-icon-button
        [attr.aria-label]="'Close ' + workspace.document.name + ' tab'"
        (click)="onCloseTab(workspace.document.id)"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  providers: [WorkspaceStore, WorkspaceTabStore],
})
export class WorkspaceTabComponent {
  @HostBinding('class') class = 'block w-full';

  @Input() set workspaceId(value: string) {
    this._workspaceTabStore.setWorkspaceId(value);
  }

  readonly workspace$ = this._workspaceStore.workspace$;

  constructor(
    private readonly _tabStore: TabStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _workspaceTabStore: WorkspaceTabStore
  ) {}

  onCloseTab(workspaceId: string) {
    this._tabStore.closeTab(workspaceId);
  }
}
