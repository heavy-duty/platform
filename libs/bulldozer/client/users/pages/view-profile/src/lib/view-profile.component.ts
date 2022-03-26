import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ConfigStore } from '@bulldozer-client/core-data-access';
import { UserStore } from '@bulldozer-client/users-data-access';
import {
  WorkspaceQueryStore,
  WorkspacesStore,
} from '@bulldozer-client/workspaces-data-access';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { tap } from 'rxjs';
import { ViewProfileStore } from './view-profile.store';

@Component({
  selector: 'bd-view-profile',
  template: `
    <div class="flex flex-col gap-5 p-5">
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

        <bd-my-workspaces-list
          *ngIf="(connected$ | ngrxPush) && (user$ | ngrxPush) !== null"
          [workspaces]="(workspaces$ | ngrxPush) ?? null"
          [activeWorkspaceId]="(activeWorkspaceId$ | ngrxPush) ?? null"
          (activateWorkspace)="onActivateWorkspace($event)"
        ></bd-my-workspaces-list>
      </main>
    </div>
  `,
  providers: [WorkspacesStore, WorkspaceQueryStore, ViewProfileStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewProfileComponent {
  readonly connected$ = this._walletStore.connected$;
  readonly user$ = this._userStore.user$.pipe(tap((a) => console.log(a)));
  readonly activeWorkspaceId$ = this._configStore.workspaceId$;
  readonly workspaces$ = this._workspacesStore.workspaces$;

  constructor(
    private readonly _userStore: UserStore,
    private readonly _walletStore: WalletStore,
    private readonly _workspacesStore: WorkspacesStore,
    private readonly _configStore: ConfigStore,
    private readonly _viewProfileStore: ViewProfileStore
  ) {}

  onCreateUser() {
    this._viewProfileStore.createUser();
  }

  onDeleteUser() {
    this._viewProfileStore.deleteUser();
  }

  onActivateWorkspace(workspaceId: string) {
    this._configStore.setWorkspaceId(workspaceId);
  }
}
