import { Component } from '@angular/core';
import { UserStore } from '@bulldozer-client/users-data-access';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { UserExplorerStore } from './user-explorer.store';

@Component({
  selector: 'bd-user-explorer-info',
  template: `
    <div class="p-8">
      <bd-user-details
        [connected]="(connected$ | ngrxPush) ?? false"
        [user]="(user$ | ngrxPush) ?? null"
        (createUser)="onCreateUser()"
        (deleteUser)="onDeleteUser()"
      ></bd-user-details>
    </div>
  `,
  styles: [],
  providers: [UserExplorerStore],
})
export class UserExplorerInfoComponent {
  readonly connected$ = this._walletStore.connected$;
  readonly user$ = this._userStore.user$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _userStore: UserStore,
    private readonly _userExplorerStore: UserExplorerStore
  ) {}
  onCreateUser() {
    this._userExplorerStore.createUser();
  }

  onDeleteUser() {
    this._userExplorerStore.deleteUser();
  }
}
