import { Injectable } from '@angular/core';
import { TabStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  InstructionStatus,
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
  combineLatest,
  concatMap,
  EMPTY,
  filter,
  from,
  map,
  of,
  pipe,
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
      combineLatest({
        authority: this._walletStore.publicKey$.pipe(
          isNotNullOrUndefined,
          map((publicKey) => publicKey.toBase58())
        ),
      })
    );
    this._workspacesStore.setWorkspaceIds(
      this._workspaceQueryStore.workspaceIds$
    );
    this._handleUserInstructions(
      this._userInstructionsStore.instructionStatuses$.pipe(take(1))
    );
    this._handleLastUserInstruction(
      this._userInstructionsStore.lastInstructionStatus$.pipe(
        isNotNullOrUndefined
      )
    );
    this._handleWorkspaceInstructions(
      this._userInstructionsStore.instructionStatuses$.pipe(take(1))
    );
    this._handleLastWorkspaceInstruction(
      this._userInstructionsStore.lastInstructionStatus$.pipe(
        isNotNullOrUndefined
      )
    );
    this._tabStore.openTab({
      id: 'profile',
      kind: 'profile',
      url: '/profile',
    });
  }

  private readonly _handleWorkspaceInstructions = this.effect<
    InstructionStatus[]
  >(
    concatMap((instructionStatuses) =>
      from(instructionStatuses).pipe(
        filter(
          (instructionStatus) =>
            (instructionStatus.name === 'createWorkspace' ||
              instructionStatus.name === 'updateWorkspace' ||
              instructionStatus.name === 'deleteWorkspace') &&
            (instructionStatus.status === 'confirmed' ||
              instructionStatus.status === 'finalized')
        ),
        tap((workspaceInstruction) =>
          this._workspacesStore.handleWorkspaceInstruction(workspaceInstruction)
        )
      )
    )
  );

  private readonly _handleLastWorkspaceInstruction =
    this.effect<InstructionStatus>(
      pipe(
        filter(
          (instructionStatus) =>
            (instructionStatus.name === 'createWorkspace' ||
              instructionStatus.name === 'updateWorkspace' ||
              instructionStatus.name === 'deleteWorkspace') &&
            (instructionStatus.status === 'confirmed' ||
              instructionStatus.status === 'finalized')
        ),
        tap((workspaceInstruction) =>
          this._workspacesStore.handleWorkspaceInstruction(workspaceInstruction)
        )
      )
    );

  private readonly _handleUserInstructions = this.effect<InstructionStatus[]>(
    concatMap((instructionStatuses) =>
      from(instructionStatuses).pipe(
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
      )
    )
  );

  private readonly _handleLastUserInstruction = this.effect<InstructionStatus>(
    pipe(
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
