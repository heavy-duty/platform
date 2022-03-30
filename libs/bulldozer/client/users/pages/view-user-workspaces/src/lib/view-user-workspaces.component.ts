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
    <bd-my-workspaces-list
      [workspaces]="(workspaces$ | ngrxPush) ?? null"
      [activeWorkspaceId]="(workspaceId$ | ngrxPush) ?? null"
      (activateWorkspace)="onActivateWorkspace($event)"
      (deleteWorkspace)="onDeleteWorkspace($event)"
    ></bd-my-workspaces-list>
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
