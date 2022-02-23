import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { ConfigStore, TabStore } from '@bulldozer-client/core-data-access';
import { UserStore } from '@bulldozer-client/users-data-access';
import {
  WorkspaceQueryStore,
  WorkspacesStore,
} from '@bulldozer-client/workspaces-data-access';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { map } from 'rxjs';

@Component({
  selector: 'bd-view-profile',
  template: `
    <header bdPageHeader>
      <h1>Profile</h1>
      <p>Visualize all the details about your profile.</p>
    </header>

    <main class="flex flex-col gap-4">
      <bd-user-details
        [connected]="(connected$ | ngrxPush) ?? false"
        [user]="(user$ | ngrxPush) ?? null"
        (createUser)="onCreateUser()"
        (deleteUser)="onDeleteUser()"
      ></bd-user-details>

      <bd-loaded-workspaces-list
        *ngIf="(connected$ | ngrxPush) && (user$ | ngrxPush) !== null"
        [workspaces]="(loadedWorkspaces$ | ngrxPush) ?? null"
        (removeWorkspace)="onRemoveWorkspace($event)"
      ></bd-loaded-workspaces-list>

      <bd-my-workspaces-list
        *ngIf="(connected$ | ngrxPush) && (user$ | ngrxPush) !== null"
        [workspaces]="(myWorkspaces$ | ngrxPush) ?? null"
        (loadWorkspace)="onLoadWorkspace($event)"
      ></bd-my-workspaces-list>
    </main>
  `,
  providers: [UserStore, WorkspacesStore, WorkspaceQueryStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewProfileComponent {
  @HostBinding('class') class = 'block p-4';
  readonly connected$ = this._walletStore.connected$;
  readonly user$ = this._userStore.user$;
  readonly loadedWorkspaces$ = this._workspacesStore.workspaces$;
  readonly myWorkspaces$ = this._workspaceQueryStore.workspaces$;

  constructor(
    private readonly _userStore: UserStore,
    private readonly _walletStore: WalletStore,
    private readonly _tabStore: TabStore,
    private readonly _workspacesStore: WorkspacesStore,
    private readonly _workspaceQueryStore: WorkspaceQueryStore,
    private readonly _configStore: ConfigStore
  ) {
    this._openTab();
    this._workspacesStore.setWorkspaceIds(this._configStore.workspaceIds$);
    this._workspaceQueryStore.setFilters(
      this._walletStore.publicKey$.pipe(
        map((publicKey) => publicKey && { authority: publicKey.toBase58() })
      )
    );
  }

  private _openTab() {
    this._tabStore.openTab({
      id: 'profile',
      kind: 'profile',
      url: '/profile',
    });
  }

  onCreateUser() {
    this._userStore.createUser();
  }

  onDeleteUser() {
    this._userStore.deleteUser();
  }

  onLoadWorkspace(workspaceId: string) {
    this._configStore.addWorkspace(workspaceId);
    this._configStore.setWorkspaceId(workspaceId);
  }

  onRemoveWorkspace(workspaceId: string) {
    this._configStore.removeWorkspace(workspaceId);
  }
}
