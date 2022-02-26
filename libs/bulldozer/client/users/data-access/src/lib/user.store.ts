import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { Document, findUserAddress, User } from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { PublicKey } from '@solana/web3.js';
import { concatMap, EMPTY, of, pipe, switchMap, withLatestFrom } from 'rxjs';
import { UserApiService } from './user-api.service';
import { UserEventService } from './user-event.service';

interface ViewModel {
  loading: boolean;
  userId: string | null;
  user: Document<User> | null;
}

const initialState: ViewModel = {
  userId: null,
  user: null,
  loading: false,
};

@Injectable()
export class UserStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly user$ = this.select(({ user }) => user);
  readonly userId$ = this.select(({ userId }) => userId);

  constructor(
    private readonly _userApiService: UserApiService,
    private readonly _userEventService: UserEventService,
    private readonly _notificationStore: NotificationStore,
    private readonly _walletStore: WalletStore
  ) {
    super(initialState);

    this._loadUserId(this._walletStore.publicKey$);
    this._loadUser(this.userId$);
    this._handleUserCreated(this._walletStore.publicKey$);
    this._handleUserDeleted(this.userId$);
  }

  private readonly _handleUserDeleted = this.effect<string | null>(
    switchMap((userId) => {
      if (userId === null) {
        return EMPTY;
      }

      return this._userEventService.userDeleted(userId).pipe(
        tapResponse(
          () => this.patchState({ user: null }),
          (error) => this._notificationStore.setError(error)
        )
      );
    })
  );

  private readonly _handleUserCreated = this.effect<PublicKey | null>(
    switchMap((walletPublicKey) => {
      if (walletPublicKey === null) {
        return EMPTY;
      }

      return this._userEventService
        .userCreated({ authority: walletPublicKey.toBase58() })
        .pipe(
          tapResponse(
            (user) => this.patchState({ user }),
            (error) => this._notificationStore.setError(error)
          )
        );
    })
  );

  private readonly _loadUserId = this.effect<PublicKey | null>(
    concatMap((walletPublicKey) => {
      if (walletPublicKey === null) {
        this.patchState({ userId: null });
        return EMPTY;
      }

      return findUserAddress(walletPublicKey.toBase58()).pipe(
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

      this.patchState({ loading: true });

      return this._userApiService.findById(userId).pipe(
        tapResponse(
          (user) => {
            this.patchState({
              user,
              loading: false,
            });
          },
          (error) => this._notificationStore.setError(error)
        )
      );
    })
  );

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
