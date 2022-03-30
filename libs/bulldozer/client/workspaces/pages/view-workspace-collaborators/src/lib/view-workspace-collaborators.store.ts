import { Injectable } from '@angular/core';
import {
  CollaboratorApiService,
  CollaboratorsStore,
  CollaboratorStore,
} from '@bulldozer-client/collaborators-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { UserStore } from '@bulldozer-client/users-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  combineLatest,
  concatMap,
  EMPTY,
  of,
  pipe,
  withLatestFrom,
} from 'rxjs';

interface ViewModel {
  workspaceId: string | null;
  showRejectedCollaborators: boolean;
  collaboratorListMode: 'pending' | 'ready';
}

const initialState: ViewModel = {
  workspaceId: null,
  showRejectedCollaborators: false,
  collaboratorListMode: 'ready',
};

@Injectable()
export class ViewWorkspaceCollaboratorsStore extends ComponentStore<ViewModel> {
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly showRejectedCollaborators$ = this.select(
    ({ showRejectedCollaborators }) => showRejectedCollaborators
  );
  readonly collaboratorListMode$ = this.select(
    ({ collaboratorListMode }) => collaboratorListMode
  );
  readonly pendingCollaborators$ = this.select(
    this._collaboratorsStore.collaborators$,
    (collaborators) =>
      collaborators
        .filter((collaborator) => collaborator.data.status.id === 0)
        .sort((a, b) => a.createdAt.toNumber() - b.createdAt.toNumber())
  );
  readonly readyCollaborators$ = this.select(
    this._collaboratorsStore.collaborators$,
    this.showRejectedCollaborators$,
    (collaborators, showRejectedCollaborators) =>
      collaborators
        .filter(
          (collaborator) =>
            collaborator.data.status.id === 1 ||
            (collaborator.data.status.id === 2 && showRejectedCollaborators)
        )
        .sort((a, b) => a.createdAt.toNumber() - b.createdAt.toNumber())
  );

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _collaboratorApiService: CollaboratorApiService,
    private readonly _collaboratorsStore: CollaboratorsStore,
    private readonly _collaboratorStore: CollaboratorStore,
    private readonly _userStore: UserStore
  ) {
    super(initialState);

    this._collaboratorStore.setWorkspaceId(this.workspaceId$);
    this._collaboratorStore.setUserId(this._userStore.userId$);
    this._collaboratorsStore.setFilters(
      combineLatest({
        workspace: this.workspaceId$.pipe(isNotNullOrUndefined),
      })
    );
  }

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({
      ...state,
      workspaceId,
    })
  );

  readonly setCollaboratorListMode = this.updater<'ready' | 'pending'>(
    (state, collaboratorListMode) => ({
      ...state,
      collaboratorListMode,
    })
  );

  readonly toggleShowRejectedCollaborators = this.updater((state) => ({
    ...state,
    showRejectedCollaborators: !state.showRejectedCollaborators,
  }));

  readonly updateCollaborator = this.effect<{
    collaboratorId: string;
    workspaceId: string;
    status: number;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ workspaceId, collaboratorId, status }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._collaboratorApiService
          .update({
            authority: authority.toBase58(),
            workspaceId,
            status,
            collaboratorId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Update collaborator request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );

  readonly requestCollaboratorStatus = this.effect<{
    workspaceId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ workspaceId }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._collaboratorApiService
          .requestCollaboratorStatus({
            authority: authority.toBase58(),
            workspaceId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Request collaborator status request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );

  readonly retryCollaboratorStatusRequest = this.effect<{
    workspaceId: string;
    collaboratorId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ workspaceId, collaboratorId }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._collaboratorApiService
          .retryCollaboratorStatusRequest({
            authority: authority.toBase58(),
            workspaceId,
            collaboratorId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Retry collaborator status request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );
}
