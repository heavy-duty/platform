import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { UserApiService } from '@bulldozer-client/users-data-access';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, of, pipe, withLatestFrom } from 'rxjs';

@Injectable()
export class ViewProfileStore extends ComponentStore<object> {
  constructor(
    private readonly _userApiService: UserApiService,
    private readonly _notificationStore: NotificationStore,
    private readonly _walletStore: WalletStore
  ) {
    super({});
  }

  readonly createUser = this.effect<void>(
    pipe(
      concatMap(() =>
        of(null).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._userApiService
          .create({
            authority: authority.toBase58(),
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent('Create user request sent'),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );

  readonly deleteUser = this.effect<void>(
    pipe(
      concatMap(() =>
        of(null).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._userApiService
          .delete({
            authority: authority.toBase58(),
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent('Delete user request sent'),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );
}
