import { Component, HostBinding } from '@angular/core';
import { ConfigStore } from '@bulldozer-client/core-data-access';
import {
  WorkspaceQueryStore,
  WorkspacesStore,
} from '@bulldozer-client/workspaces-data-access';
import { UserWorkspacesStore } from './user-workspaces.store';

@Component({
  selector: 'bd-user-explorer-workspaces',
  template: `
    <bd-my-workspaces-list
      [workspaces]="(workspaces$ | ngrxPush) ?? null"
      [activeWorkspaceId]="(workspaceId$ | ngrxPush) ?? null"
      (activateWorkspace)="onActivateWorkspace($event)"
      (deleteWorkspace)="onDeleteWorkspace($event)"
    ></bd-my-workspaces-list>
  `,
  styles: [],
  providers: [WorkspacesStore, WorkspaceQueryStore, UserWorkspacesStore],
})
export class UserWorkspacesComponent {
  @HostBinding('class') class = 'block p-8';
  readonly workspaces$ = this._workspacesStore.workspaces$;
  readonly workspaceId$ = this._configStore.workspaceId$;

  constructor(
    private readonly _workspacesStore: WorkspacesStore,
    private readonly _configStore: ConfigStore,
    private readonly _userWorkspacesStore: UserWorkspacesStore
  ) {}

  onActivateWorkspace(workspaceId: string) {
    this._configStore.setWorkspaceId(workspaceId);
  }

  onDeleteWorkspace(workspaceId: string) {
    this._userWorkspacesStore.deleteWorkspace(workspaceId);
  }
}
