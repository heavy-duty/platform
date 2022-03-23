import { Injectable } from '@angular/core';
import { TabStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  UserApiService,
  UserInstructionsStore,
  UserStore,
} from '@bulldozer-client/users-data-access';
import {
  WorkspaceQueryStore,
  WorkspacesStore,
} from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  filter,
  from,
  map,
  merge,
  of,
  pipe,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs';

@Injectable()
export class ViewProfileStore extends ComponentStore<object> {
  constructor(
    private readonly _userApiService: UserApiService,
    private readonly _notificationStore: NotificationStore,
    private readonly _walletStore: WalletStore,
    private readonly _tabStore: TabStore,
    private readonly _workspacesStore: WorkspacesStore,
    private readonly _workspaceQueryStore: WorkspaceQueryStore,
    private readonly _userStore: UserStore,
    private readonly _userInstructionsStore: UserInstructionsStore
  ) {
    super({});

    this._workspaceQueryStore.setFilters(
      this._walletStore.publicKey$.pipe(
        map((publicKey) => publicKey && { authority: publicKey.toBase58() })
      )
    );
    this._workspacesStore.setWorkspaceIds(
      this._workspaceQueryStore.workspaceIds$
    );
    this._watchWorkspaces(this._workspacesStore.loading$);
    this._watchUser(this._userStore.loading$);
    this._tabStore.openTab({
      id: 'profile',
      kind: 'profile',
      url: '/profile',
    });
  }

  private readonly _watchWorkspaces = this.effect<boolean>(
    pipe(
      concatMap((loading) =>
        of(loading).pipe(withLatestFrom(this._workspacesStore.workspaces$))
      ),
      switchMap(([loading, workspaces]) => {
        if (loading !== false && workspaces === null) {
          return EMPTY;
        }

        return merge(
          this._userInstructionsStore.instructionStatuses$.pipe(
            take(1),
            concatMap((instructionStatuses) => from(instructionStatuses))
          ),
          this._userInstructionsStore.lastInstructionStatus$.pipe(
            isNotNullOrUndefined
          )
        ).pipe(
          filter(
            (instructionStatus) =>
              (instructionStatus.name === 'createWorkspace' ||
                instructionStatus.name === 'updateWorkspace' ||
                instructionStatus.name === 'deleteWorkspace') &&
              (instructionStatus.status === 'confirmed' ||
                instructionStatus.status === 'finalized')
          ),
          tap((userInstruction) =>
            this._workspacesStore.handleWorkspaceInstruction(userInstruction)
          )
        );
      })
    )
  );

  private readonly _watchUser = this.effect<boolean>(
    pipe(
      concatMap((loading) =>
        of(loading).pipe(withLatestFrom(this._userStore.user$))
      ),
      switchMap(([loading, user]) => {
        if (loading !== false && user === null) {
          return EMPTY;
        }

        return merge(
          this._userInstructionsStore.instructionStatuses$.pipe(
            take(1),
            concatMap((instructionStatuses) => from(instructionStatuses))
          ),
          this._userInstructionsStore.lastInstructionStatus$.pipe(
            isNotNullOrUndefined
          )
        ).pipe(
          filter(
            (instructionStatus) =>
              (instructionStatus.name === 'createUser' ||
                instructionStatus.name === 'deleteUser') &&
              (instructionStatus.status === 'confirmed' ||
                instructionStatus.status === 'finalized')
          ),
          tap((userInstruction) =>
            this._userStore.handleUserInstruction(userInstruction)
          )
        );
      })
    )
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
