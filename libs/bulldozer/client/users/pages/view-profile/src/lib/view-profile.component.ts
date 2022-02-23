import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { ConfigStore, TabStore } from '@bulldozer-client/core-data-access';
import { UserStore } from '@bulldozer-client/users-data-access';
import {
  WorkspaceQueryStore,
  WorkspacesStore,
} from '@bulldozer-client/workspaces-data-access';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { map, tap } from 'rxjs';

@Component({
  selector: 'bd-view-profile',
  template: `
    <header bdPageHeader>
      <h1>Profile</h1>
      <p>Visualize all the details about your profile.</p>
    </header>

    <main>
      <ng-container *ngIf="connected$ | ngrxPush; else notConnected">
        <ng-container *ngIf="user$ | ngrxPush as user; else userNotDefined">
          <section>
            <h2>User ID: {{ user.id | obscureAddress }}</h2>

            <p>
              Created at:
              {{ user.createdAt.toNumber() * 1000 | date: 'medium' }}
            </p>

            <button mat-raised-button color="warn" (click)="onDeleteUser()">
              Delete User
            </button>
          </section>

          <section>
            <h2>Loaded Workspaces</h2>

            <ul>
              <li *ngFor="let workspace of loadedWorkspaces$ | ngrxPush">
                <h3>{{ workspace.name }}</h3>

                <p>{{ workspace.id }}</p>

                <a [routerLink]="['/workspaces', workspace.id]">View</a>

                <button
                  mat-raised-button
                  color="warn"
                  (click)="onRemoveWorkspace(workspace.id)"
                >
                  Remove
                </button>
              </li>
            </ul>
          </section>

          <section>
            <h2>My Workspaces</h2>

            <ul>
              <li *ngFor="let workspace of myWorkspaces$ | ngrxPush">
                <h3>{{ workspace.name }}</h3>

                <p>{{ workspace.id }}</p>

                <a [routerLink]="['/workspaces', workspace.id]">View</a>

                <button
                  mat-raised-button
                  color="primary"
                  (click)="onLoadWorkspace(workspace.id)"
                >
                  Load
                </button>
              </li>
            </ul>
          </section>
        </ng-container>
        <ng-template #userNotDefined>
          <section>
            <h2>You have no user defined.</h2>

            <button mat-raised-button color="primary" (click)="onCreateUser()">
              Create User
            </button>
          </section>
        </ng-template>
      </ng-container>

      <ng-template #notConnected>
        <section>
          <h2>Connect your wallet in order to view your profile.</h2>

          <hd-wallet-multi-button color="primary"></hd-wallet-multi-button>
        </section>
      </ng-template>
    </main>
  `,
  providers: [UserStore, WorkspacesStore, WorkspaceQueryStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewProfileComponent extends ComponentStore<object> {
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
    super({});

    this._openTab();
    this._workspacesStore.setWorkspaceIds(this._configStore.workspaceIds$);
    this._workspaceQueryStore.setFilters(
      this._walletStore.publicKey$.pipe(
        map((publicKey) => publicKey && { authority: publicKey.toBase58() })
      )
    );
  }

  private readonly _openTab = this.effect<void>(
    tap(() => {
      this._tabStore.openTab({
        id: 'profile',
        kind: 'profile',
        url: '/profile',
      });
    })
  );

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
