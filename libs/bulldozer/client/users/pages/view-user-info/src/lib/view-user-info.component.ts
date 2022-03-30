import { Component, HostBinding } from '@angular/core';
import { UserStore } from '@bulldozer-client/users-data-access';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ViewUserInfoStore } from './view-user-info.store';

@Component({
  selector: 'bd-view-user-info',
  template: `
    <bd-user-details
      [connected]="(connected$ | ngrxPush) ?? false"
      [user]="(user$ | ngrxPush) ?? null"
      (createUser)="onCreateUser()"
      (deleteUser)="onDeleteUser()"
    ></bd-user-details>
  `,
  styles: [],
  providers: [ViewUserInfoStore, UserStore],
})
export class ViewUserInfoComponent {
  @HostBinding('class') class = 'block p-8';
  readonly connected$ = this._walletStore.connected$;
  readonly user$ = this._userStore.user$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _userStore: UserStore,
    private readonly _viewUserInfoStore: ViewUserInfoStore
  ) {}

  onCreateUser() {
    this._viewUserInfoStore.createUser();
  }

  onDeleteUser() {
    this._viewUserInfoStore.deleteUser();
  }
}
