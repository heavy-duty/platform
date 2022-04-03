import { Injectable } from '@angular/core';
import {
  CollaboratorApiService,
  CollaboratorsStore,
  CollaboratorStore,
} from '@bulldozer-client/collaborators-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { UserApiService, UserStore } from '@bulldozer-client/users-data-access';
import { Collaborator, Document, User } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  combineLatest,
  concatMap,
  EMPTY,
  forkJoin,
  map,
  of,
  pipe,
  switchMap,
  withLatestFrom,
} from 'rxjs';

export type CollaboratorStatus = 'approved' | 'pending' | 'rejected';

export interface CollaboratorView extends Document<Collaborator> {
  user: Document<User>;
}

interface ViewModel {
  workspaceId: string | null;
  collaboratorStatus: CollaboratorStatus;
  collaborators: CollaboratorView[];
  collaboratorId: string | null;
  loading: boolean;
  error: unknown | null;
}

const initialState: ViewModel = {
  workspaceId: null,
  collaboratorStatus: 'approved',
  collaboratorId: null,
  collaborators: [],
  loading: false,
  error: null,
};

@Injectable()
export class ViewWorkspaceCollaboratorsStore extends ComponentStore<ViewModel> {
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly collaboratorStatus$ = this.select(
    ({ collaboratorStatus }) => collaboratorStatus
  );
  readonly collaboratorId$ = this.select(
    ({ collaboratorId }) => collaboratorId
  );
  readonly loading$ = this.select(({ loading }) => loading);
  readonly collaborators$ = this.select(({ collaborators }) => collaborators);
  readonly filteredCollaborators$ = this.select(
    this.collaborators$,
    this.collaboratorStatus$,
    (collaborators, status) =>
      collaborators
        .filter((collaborator) => {
          switch (status) {
            case 'pending':
              return collaborator.data.status.id === 0;
            case 'approved':
              return collaborator.data.status.id === 1;
            case 'rejected':
              return collaborator.data.status.id === 2;
            default:
              return false;
          }
        })
        .sort((a, b) => a.createdAt.toNumber() - b.createdAt.toNumber())
  );
  readonly selectedCollaborator$ = this.select(
    this.filteredCollaborators$,
    this.collaboratorId$,
    (collaborators, collaboratorId) => {
      if (collaborators.length === 0) {
        return null;
      }

      if (collaboratorId === null) {
        return collaborators[0];
      }

      const selectedCollaborator = collaborators.find(
        (collaborator) => collaborator.id === collaboratorId
      );

      if (selectedCollaborator === undefined) {
        return collaborators[0];
      }

      return selectedCollaborator;
    }
  );

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _collaboratorApiService: CollaboratorApiService,
    private readonly _collaboratorsStore: CollaboratorsStore,
    private readonly _collaboratorStore: CollaboratorStore,
    private readonly _userApiService: UserApiService,
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
    this._loadCollaborators(this._collaboratorsStore.collaborators$);
  }

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({
      ...state,
      workspaceId,
    })
  );

  readonly setCollaboratorStatus = this.updater<CollaboratorStatus>(
    (state, collaboratorStatus) => ({
      ...state,
      collaboratorStatus,
    })
  );

  readonly setCollaboratorId = this.updater<string | null>(
    (state, collaboratorId) => ({
      ...state,
      collaboratorId,
    })
  );

  private readonly _loadCollaborators = this.effect<Document<Collaborator>[]>(
    switchMap((collaborators) => {
      this.patchState({ loading: true });

      return forkJoin(
        collaborators.map((collaborator) =>
          this._userApiService.findById(collaborator.data.user).pipe(
            isNotNullOrUndefined,
            map((user) => ({ user, ...collaborator }))
          )
        )
      ).pipe(
        tapResponse(
          (collaborators) => this.patchState({ collaborators, loading: false }),
          (error) => this.patchState({ error, loading: false })
        )
      );
    })
  );

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
