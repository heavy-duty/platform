import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ConfigStore } from '@bulldozer-client/core-data-access';
import { UserStore } from '@bulldozer-client/users-data-access';
import {
  WorkspaceQueryStore,
  WorkspacesStore,
} from '@bulldozer-client/workspaces-data-access';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ViewProfileStore } from './view-profile.store';

@Component({
  selector: 'bd-view-profile',
  template: `
    <div class="flex flex-col">
      <mat-sidenav-container class="hd-view-profile-height">
        <mat-sidenav
          #userProfileInfo
          class="w-96"
          [mode]="'side'"
          [opened]="true"
        >
          <header class="py-5 px-7 border-b mb-5 w-full hd-border-gray">
            <h2 class="mb-0 ">PROFILE</h2>
            <small class="leading-3">
              Visualize all the details about your profile and workspaces
            </small>
          </header>

          <main class="flex flex-col">
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

            <mat-selection-list #shoes [multiple]="false">
              <mat-list-option
                [value]="'user-info'"
                [routerLink]="['/profile', 'user-info']"
              >
                <div class="py-6">
                  <h3 class="mb-1">User Info</h3>
                  <small class="leading-3"> Visualize your user details </small>
                </div>
              </mat-list-option>
              <mat-list-option
                [value]="'workspaces'"
                [routerLink]="['/profile', 'workspaces']"
              >
                <div class="py-6">
                  <h3 class="mb-1">Workspaces</h3>
                  <small class="leading-3">
                    Visualize all your workspaces
                  </small>
                </div>
              </mat-list-option>
            </mat-selection-list>
          </main>
        </mat-sidenav>
        <mat-sidenav-content>
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  providers: [WorkspacesStore, WorkspaceQueryStore, ViewProfileStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewProfileComponent implements OnInit {
  readonly connected$ = this._walletStore.connected$;
  readonly user$ = this._userStore.user$;
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

  ngOnInit(): void {
    this.workspaces$.subscribe((data) =>
      console.log('la data desde profile', data)
    );
  }
}
