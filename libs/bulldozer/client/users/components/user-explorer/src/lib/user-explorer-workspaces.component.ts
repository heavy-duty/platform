import { Component } from '@angular/core';
import { ConfigStore } from '@bulldozer-client/core-data-access';
import { UserStore } from '@bulldozer-client/users-data-access';
import { WorkspacesStore } from '@bulldozer-client/workspaces-data-access';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { UserExplorerStore } from './user-explorer.store';

@Component({
  selector: 'bd-user-explorer-workspaces',
  template: `
    <div class="p-8">
      <bd-my-workspaces-list
        *ngIf="(connected$ | ngrxPush) && (user$ | ngrxPush) !== null"
        [workspaces]="(workspaces$ | ngrxPush) ?? null"
        [activeWorkspaceId]="(activeWorkspaceId$ | ngrxPush) ?? null"
        (activateWorkspace)="onActivateWorkspace($event)"
        (deleteWorkspace)="onDeleteWorkspace($event)"
      ></bd-my-workspaces-list>
    </div>
  `,
  styles: [],
  providers: [],
})
export class UserExplorerWorkspacesComponent {
  readonly connected$ = this._walletStore.connected$;
  readonly workspaces$ = this._workspacesStore.workspaces$;
  readonly activeWorkspaceId$ = this._configStore.workspaceId$;
  readonly user$ = this._userStore.user$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _workspacesStore: WorkspacesStore,
    private readonly _userStore: UserStore,
    private readonly _configStore: ConfigStore,
    private readonly _userExplorerStore: UserExplorerStore
  ) {}

  onActivateWorkspace(workspaceId: string) {
    this._configStore.setWorkspaceId(workspaceId);
  }

  onDeleteWorkspace(workspaceId: string) {
    this._userExplorerStore.deleteWorkspace(workspaceId);
  }
}
