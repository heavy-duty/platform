import { Component, HostBinding } from '@angular/core';
import { TabStore } from '@bulldozer-client/core-data-access';
import { UserStore } from '@bulldozer-client/users-data-access';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { tap } from 'rxjs';

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
          <h2>User ID: {{ user.id | obscureAddress }}</h2>

          <p>
            Created at: {{ user.createdAt.toNumber() * 1000 | date: 'medium' }}
          </p>

          <button mat-raised-button color="warn" (click)="onDeleteUser()">
            Delete User
          </button>
        </ng-container>
        <ng-template #userNotDefined>
          <h2>You have no user defined.</h2>

          <button mat-raised-button color="primary" (click)="onCreateUser()">
            Create User
          </button>
        </ng-template>
      </ng-container>

      <ng-template #notConnected>
        <h2>Connect your wallet in order to view your profile.</h2>

        <hd-wallet-multi-button color="primary"></hd-wallet-multi-button>
      </ng-template>
    </main>
  `,
  providers: [UserStore],
})
export class ViewProfileComponent extends ComponentStore<object> {
  @HostBinding('class') class = 'block p-4';
  readonly connected$ = this._walletStore.connected$;
  readonly user$ = this._userStore.user$;

  constructor(
    private readonly _userStore: UserStore,
    private readonly _walletStore: WalletStore,
    private readonly _tabStore: TabStore
  ) {
    super({});

    this._openTab();
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
}
