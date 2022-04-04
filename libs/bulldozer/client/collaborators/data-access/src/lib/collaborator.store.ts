import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/workspaces-data-access';
import {
  Collaborator,
  Document,
  findCollaboratorAddress,
} from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, switchMap } from 'rxjs';
import { CollaboratorApiService } from './collaborator-api.service';
import { ItemView } from './types';

export type CollaboratorView = ItemView<Document<Collaborator>>;

interface ViewModel {
  loading: boolean;
  workspaceId: string | null;
  userId: string | null;
  collaboratorId: string | null;
  collaborator: CollaboratorView | null;
}

const initialState: ViewModel = {
  workspaceId: null,
  userId: null,
  collaboratorId: null,
  collaborator: null,
  loading: false,
};

@Injectable()
export class CollaboratorStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly collaborator$ = this.select(({ collaborator }) => collaborator);
  readonly collaboratorId$ = this.select(
    ({ collaboratorId }) => collaboratorId
  );
  readonly userId$ = this.select(({ userId }) => userId);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(
    private readonly _collaboratorApiService: CollaboratorApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadCollaboratorId(
      this.select(this.workspaceId$, this.userId$, (workspaceId, userId) => ({
        workspaceId,
        userId,
      }))
    );
    this._loadCollaborator(this.collaboratorId$);
  }

  readonly setUserId = this.updater<string | null>((state, userId) => ({
    ...state,
    userId,
  }));

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({ ...state, workspaceId })
  );

  private readonly _patchStatus = this.updater<{
    isCreating?: boolean;
    isUpdating?: boolean;
    isDeleting?: boolean;
  }>((state, statuses) => ({
    ...state,
    collaborator: state.collaborator
      ? {
          ...state.collaborator,
          ...statuses,
        }
      : null,
  }));

  private readonly _setCollaborator = this.updater<CollaboratorView | null>(
    (state, collaborator) => ({
      ...state,
      collaborator,
    })
  );

  private readonly _loadCollaboratorId = this.effect<{
    userId: string | null;
    workspaceId: string | null;
  }>(
    concatMap(({ userId, workspaceId }) => {
      if (userId === null || workspaceId === null) {
        this.patchState({ collaboratorId: null });
        return EMPTY;
      }

      return findCollaboratorAddress(workspaceId, userId).pipe(
        tapResponse(
          ([collaboratorId]) => this.patchState({ collaboratorId }),
          (error) => this._notificationStore.setError(error)
        )
      );
    })
  );

  private readonly _loadCollaborator = this.effect<string | null>(
    switchMap((collaboratorId) => {
      if (collaboratorId === null) {
        this.patchState({ collaborator: null });
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._collaboratorApiService.findById(collaboratorId).pipe(
        tapResponse(
          (collaborator) => {
            if (collaborator !== null) {
              this._setCollaborator({
                document: collaborator,
                isCreating: false,
                isUpdating: false,
                isDeleting: false,
              });
            }
            this.patchState({ loading: false });
          },
          (error) => this._notificationStore.setError({ error, loading: false })
        )
      );
    })
  );

  readonly dispatch = this.effect<InstructionStatus>(
    concatMap((instructionStatus) => {
      const collaboratorAccountMeta = instructionStatus.accounts.find(
        (account) => account.name === 'Collaborator'
      );

      if (collaboratorAccountMeta === undefined) {
        return EMPTY;
      }

      switch (instructionStatus.name) {
        case 'createCollaborator': {
          if (instructionStatus.status === 'finalized') {
            this._patchStatus({ isCreating: false });
            return EMPTY;
          }

          return this._collaboratorApiService
            .findById(collaboratorAccountMeta.pubkey, 'confirmed')
            .pipe(
              tapResponse(
                (collaborator) => {
                  if (collaborator !== null) {
                    this._setCollaborator({
                      document: collaborator,
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
        case 'updateCollaborator': {
          if (instructionStatus.status === 'finalized') {
            this._patchStatus({ isUpdating: false });
            return EMPTY;
          }

          return this._collaboratorApiService
            .findById(collaboratorAccountMeta.pubkey, 'confirmed')
            .pipe(
              tapResponse(
                (collaborator) => {
                  if (collaborator !== null) {
                    this._setCollaborator({
                      document: collaborator,
                      isCreating: false,
                      isUpdating: true,
                      isDeleting: false,
                    });
                  }
                },
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'deleteCollaborator': {
          if (instructionStatus.status === 'confirmed') {
            this._patchStatus({ isDeleting: true });
          } else {
            this.patchState({ collaborator: null });
            this._patchStatus({ isDeleting: false });
          }

          return EMPTY;
        }
        default:
          return EMPTY;
      }
    })
  );
}
