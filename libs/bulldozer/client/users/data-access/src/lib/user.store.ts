import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { Document, findUserAddress, User } from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { PublicKey } from '@solana/web3.js';
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  EMPTY,
  map,
  switchMap,
} from 'rxjs';
import { ItemView } from './types';
import { UserApiService } from './user-api.service';
import { InstructionStatus } from './user-instructions.store';

export type UserView = ItemView<Document<User>>;

interface ViewModel {
  loading: boolean;
  userId: string | null;
  user: UserView | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  userId: null,
  user: null,
  loading: false,
  error: null,
};

@Injectable()
export class UserStore extends ComponentStore<ViewModel> {
  private readonly _reload = new BehaviorSubject(null);
  private readonly reload$ = this._reload.asObservable();
  readonly loading$ = this.select(({ loading }) => loading);
  readonly user$ = this.select(({ user }) => user);
  readonly userId$ = this.select(({ userId }) => userId);

  constructor(
    private readonly _userApiService: UserApiService,
    private readonly _notificationStore: NotificationStore,
    private readonly _walletStore: WalletStore
  ) {
    super(initialState);

    this._loadUserId(this._walletStore.publicKey$);
    this._loadUser(
      combineLatest([this.userId$, this.reload$]).pipe(
        map(([userId]) => userId)
      )
    );
  }

  private readonly _setUser = this.updater<UserView | null>((state, user) => ({
    ...state,
    user,
  }));

  private readonly _patchUserStatuses = this.updater<{
    isCreating?: boolean;
    isUpdating?: boolean;
    isDeleting?: boolean;
  }>((state, statuses) => ({
    ...state,
    user: state.user
      ? {
          ...state.user,
          ...statuses,
        }
      : null,
  }));

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
            if (user) {
              this._setUser({
                document: user,
                isCreating: false,
                isUpdating: false,
                isDeleting: false,
              });
            }
            this.patchState({
              loading: false,
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

  readonly handleUserInstruction = this.effect<InstructionStatus>(
    concatMap((userInstruction) => {
      const userAccountMeta = userInstruction.accounts.find(
        (account) => account.name === 'User'
      );

      if (userAccountMeta === undefined) {
        return EMPTY;
      }

      switch (userInstruction.name) {
        case 'createUser': {
          if (userInstruction.status === 'finalized') {
            this._patchUserStatuses({ isCreating: false });
            return EMPTY;
          }

          return this._userApiService
            .findById(userAccountMeta.pubkey, 'confirmed')
            .pipe(
              tapResponse(
                (user) => {
                  if (user !== null) {
                    this._setUser({
                      document: user,
                      isCreating: true,
                      isUpdating: false,
                      isDeleting: false,
                    });
                  }
                },
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'deleteUser': {
          if (userInstruction.status === 'confirmed') {
            this._patchUserStatuses({ isDeleting: true });
          } else {
            this._patchUserStatuses({ isDeleting: false });
            this.patchState({ user: null });
          }

          return EMPTY;
        }
        default:
          return EMPTY;
      }
    })
  );

  reload() {
    this._reload.next(null);
  }
}
