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
  filter,
  map,
  pairwise,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import { UserApiService } from './user-api.service';

interface ViewModel {
  loading: boolean;
  userId: string | null;
  user: Document<User> | null;
  isCreating: boolean;
  isDeleting: boolean;
  error: unknown | null;
}

const initialState: ViewModel = {
  userId: null,
  user: null,
  loading: false,
  isCreating: false,
  isDeleting: false,
  error: null,
};

@Injectable()
export class UserStore extends ComponentStore<ViewModel> {
  private readonly _reload = new BehaviorSubject(null);
  private readonly reload$ = this._reload.asObservable();
  readonly loading$ = this.select(({ loading }) => loading);
  readonly user$ = this.select(({ user }) => user);
  readonly userId$ = this.select(({ userId }) => userId);
  readonly isCreating$ = this.select(({ isCreating }) => isCreating);
  readonly isDeleting$ = this.select(({ isDeleting }) => isDeleting);

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
    this._handleUserCreated(this.isCreating$);
    this._handleUserDeleted(this.isDeleting$);
  }

  readonly toggleCreating = this.updater<boolean>((state, isCreating) => ({
    ...state,
    isCreating,
  }));

  readonly toggleDeleting = this.updater<boolean>((state, isDeleting) => ({
    ...state,
    isDeleting,
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
            this.patchState({
              user,
              loading: false,
            });
          },
          (error) => {
            this.patchState({ error });
            this._notificationStore.setError(error);
          }
        )
      );
    })
  );

  private readonly _handleUserCreated = this.effect<boolean>(
    pipe(
      filter((isCreating) => isCreating),
      tap(() => this.reload())
    )
  );

  private readonly _handleUserDeleted = this.effect<boolean>(
    pipe(
      pairwise(),
      filter(([previous, current]) => previous && !current),
      tap(() => this.patchState({ user: null }))
    )
  );

  reload() {
    this._reload.next(null);
  }
}
