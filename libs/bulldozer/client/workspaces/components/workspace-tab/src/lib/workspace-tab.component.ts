import { Component, HostBinding, Input } from '@angular/core';
import { WorkspaceStore } from '@bulldozer-client/workspaces-data-access';
import { WorkspaceTabStore } from './workspace-tab.store';

@Component({
  selector: 'bd-workspace-tab',
  template: `
    <div
      *ngIf="workspace$ | ngrxPush as workspace"
      class="flex items-stretch p-0"
      style="max-width: 12rem"
    >
      <a
        [routerLink]="['/workspaces', workspace.id]"
        class="flex items-center pl-4 gap-1 w-full"
        style="max-width: 75%"
        [matTooltip]="workspace.name"
        matTooltipShowDelay="500"
      >
        <span
          class="text-left overflow-hidden whitespace-nowrap overflow-ellipsis"
        >
          {{ workspace.name }}
        </span>
        <hd-account-updating [accountId]="workspace.id"></hd-account-updating>
      </a>
      <button
        mat-icon-button
        [attr.aria-label]="'Close ' + workspace.name + ' tab'"
        (click)="onCloseTab()"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  providers: [WorkspaceStore, WorkspaceTabStore],
})
export class WorkspaceTabComponent {
  @HostBinding('class') class = 'block w-full';

  private _workspaceId!: string;
  @Input() set workspaceId(value: string) {
    this._workspaceId = value;
    this._workspaceStore.setWorkspaceId(this.workspaceId);
  }
  get workspaceId() {
    return this._workspaceId;
  }

  readonly workspace$ = this._workspaceStore.workspace$;

  constructor(
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _workspaceTabStore: WorkspaceTabStore
  ) {}

  onCloseTab() {
    this._workspaceTabStore.closeTab(this.workspaceId);
  }
}
