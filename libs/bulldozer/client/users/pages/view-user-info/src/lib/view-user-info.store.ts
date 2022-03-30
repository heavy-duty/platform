import { Injectable } from '@angular/core';
import { TabStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  InstructionStatus,
  UserApiService,
  UserInstructionsStore,
  UserStore,
} from '@bulldozer-client/users-data-access';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, of, pipe, tap, withLatestFrom } from 'rxjs';

@Injectable()
export class ViewUserInfoStore extends ComponentStore<object> {
  constructor(
    private readonly _userApiService: UserApiService,
    private readonly _notificationStore: NotificationStore,
    private readonly _tabStore: TabStore,
    private readonly _walletStore: WalletStore,
    private readonly _userStore: UserStore,
    private readonly _userInstructionsStore: UserInstructionsStore
  ) {
    super({});

    this._tabStore.openTab({
      id: 'profile',
      kind: 'profile',
      url: '/profile',
    });
    this._handleInstruction(this._userInstructionsStore.instruction$);
  }

  private readonly _handleInstruction = this.effect<InstructionStatus>(
    tap((instructionStatus) => {
      switch (instructionStatus.name) {
        case 'createUser':
        case 'deleteUser': {
          this._userStore.handleUserInstruction(instructionStatus);
          break;
        }
        default:
          break;
      }
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
