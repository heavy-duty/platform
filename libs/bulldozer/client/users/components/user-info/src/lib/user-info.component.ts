import { Component, HostBinding } from '@angular/core';
import { UserStore } from '@bulldozer-client/users-data-access';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { UserInfoStore } from './user-info.store';

@Component({
  selector: 'bd-user-info',
  template: `
    <bd-user-details
      [connected]="(connected$ | ngrxPush) ?? false"
      [user]="(user$ | ngrxPush) ?? null"
      (createUser)="onCreateUser()"
      (deleteUser)="onDeleteUser()"
    ></bd-user-details>
  `,
  styles: [],
  providers: [UserInfoStore, UserStore],
})
export class UserInfoComponent {
  @HostBinding('class') class = 'block p-8';
  readonly connected$ = this._walletStore.connected$;
  readonly user$ = this._userStore.user$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _userStore: UserStore,
    private readonly _userInfoStore: UserInfoStore
  ) {}

  onCreateUser() {
    this._userInfoStore.createUser();
  }

  onDeleteUser() {
    this._userInfoStore.deleteUser();
  }
}
