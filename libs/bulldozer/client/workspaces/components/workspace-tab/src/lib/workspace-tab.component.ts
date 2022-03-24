import { Component, HostBinding, Input } from '@angular/core';
import { WorkspaceStore } from '@bulldozer-client/workspaces-data-access';
import { WorkspaceTabStore } from './workspace-tab.store';

@Component({
  selector: 'bd-workspace-tab',
  template: `
    <div
      *ngIf="workspace$ | ngrxPush as workspace"
      class="flex items-stretch p-0"
    >
      <a
        [routerLink]="['/workspaces', workspace.id]"
        class="w-40 flex justify-between gap-2 items-center pl-4 flex-grow"
        [matTooltip]="(tooltipMessage$ | ngrxPush) ?? ''"
      >
        <span
          class="flex-grow text-left overflow-hidden whitespace-nowrap overflow-ellipsis"
        >
          {{ workspace.name }}
        </span>
        <mat-progress-spinner
          class="flex-shrink-0"
          *ngIf="showSpinner$ | ngrxPush"
          mode="indeterminate"
          diameter="16"
        ></mat-progress-spinner>
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
  readonly showSpinner$ = this._workspaceTabStore.showSpinner$;
  readonly tooltipMessage$ = this._workspaceTabStore.tooltipMessage$;

  constructor(
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _workspaceTabStore: WorkspaceTabStore
  ) {}

  onCloseTab() {
    this._workspaceTabStore.closeTab(this.workspaceId);
  }
}
