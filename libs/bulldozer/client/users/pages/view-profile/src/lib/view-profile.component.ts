import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ConfigStore, TabStore } from '@bulldozer-client/core-data-access';
import {
  UserInstructionsStore,
  UserStore,
} from '@bulldozer-client/users-data-access';
import {
  WorkspaceQueryStore,
  WorkspacesStore,
} from '@bulldozer-client/workspaces-data-access';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { map } from 'rxjs';
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
          [isCreating]="(isCreatingUser$ | ngrxPush) ?? false"
          [isDeleting]="(isDeletingUser$ | ngrxPush) ?? false"
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
    </div>
  `,
  providers: [WorkspacesStore, WorkspaceQueryStore, ViewProfileStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewProfileComponent {
  readonly connected$ = this._walletStore.connected$;
  readonly user$ = this._userStore.user$;
  readonly loadedWorkspaces$ = this._workspacesStore.workspaces$;
  readonly myWorkspaces$ = this._workspaceQueryStore.workspaces$;
  readonly isCreatingUser$ = this._userStore.isCreating$;
  readonly isDeletingUser$ = this._userStore.isDeleting$;

  constructor(
    private readonly _userStore: UserStore,
    private readonly _walletStore: WalletStore,
    private readonly _tabStore: TabStore,
    private readonly _workspacesStore: WorkspacesStore,
    private readonly _workspaceQueryStore: WorkspaceQueryStore,
    private readonly _configStore: ConfigStore,
    private readonly _userInstructionsStore: UserInstructionsStore,
    private readonly _viewProfileStore: ViewProfileStore
  ) {
    this._openTab();
    this._workspacesStore.setWorkspaceIds(this._configStore.workspaceIds$);
    this._workspaceQueryStore.setFilters(
      this._walletStore.publicKey$.pipe(
        map((publicKey) => publicKey && { authority: publicKey.toBase58() })
      )
    );
    this._userStore.toggleCreating(
      this._userInstructionsStore.instructionStatuses$.pipe(
        map((instructionStatuses) =>
          instructionStatuses
            .filter(
              (instructionStatus) => instructionStatus.name === 'createUser'
            )
            .some(
              (instructionStatus) => instructionStatus.status === 'confirmed'
            )
        )
      )
    );
    this._userStore.toggleDeleting(
      this._userInstructionsStore.instructionStatuses$.pipe(
        map((instructionStatuses) =>
          instructionStatuses
            .filter(
              (instructionStatus) => instructionStatus.name === 'deleteUser'
            )
            .some(
              (instructionStatus) => instructionStatus.status === 'confirmed'
            )
        )
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
    this._viewProfileStore.createUser();
  }

  onDeleteUser() {
    this._viewProfileStore.deleteUser();
  }

  onLoadWorkspace(workspaceId: string) {
    this._configStore.addWorkspace(workspaceId);
    this._configStore.setWorkspaceId(workspaceId);
  }

  onRemoveWorkspace(workspaceId: string) {
    this._configStore.removeWorkspace(workspaceId);
  }
}
