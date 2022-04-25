import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { UserApiService } from '@bulldozer-client/users-data-access';
import { Document, findUserAddress, User } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, map, switchMap } from 'rxjs';

interface ViewModel {
  loading: boolean;
  userId: string | null;
  user: Document<User> | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  userId: null,
  user: null,
  loading: false,
  error: null,
};

@Injectable()
export class AuthStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly user$ = this.select(({ user }) => user);
  readonly userId$ = this.select(({ userId }) => userId);

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _userApiService: UserApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadUserId(
      this._walletStore.publicKey$.pipe(
        isNotNullOrUndefined,
        map((publicKey) => publicKey.toBase58())
      )
    );
    this._loadUser(this.userId$);
  }

  private readonly _loadUserId = this.effect<string | null>(
    concatMap((authority) => {
      if (authority === null) {
        this.patchState({ userId: null });
        return EMPTY;
      }

      this.patchState({ user: null, loading: true });

      return findUserAddress(authority).pipe(
        tapResponse(
          ([userId]) => this.patchState({ userId }),
          (error) => this._notificationStore.setError(error)
        )
      );
    })
  );

  private readonly _loadUser = this.effect<string | null>(
    switchMap((userId) => {
      if (userId === null) {
        return EMPTY;
      }

      return this._userApiService.findById(userId).pipe(
        tapResponse(
          (user) => {
            this.patchState({
              loading: false,
              user,
            });
          },
          (error) => {
            this.patchState({ error, loading: false });
            this._notificationStore.setError(error);
          }
        )
      );
    })
  );
}
