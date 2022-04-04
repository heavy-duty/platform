import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { Collaborator, Document } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, switchMap } from 'rxjs';
import { CollaboratorApiService } from './collaborator-api.service';
import { ItemView } from './types';

export type CollaboratorItemView = ItemView<Document<Collaborator>>;
interface ViewModel {
  loading: boolean;
  collaboratorIds: string[] | null;
  collaboratorsMap: Map<string, CollaboratorItemView>;
}

const initialState: ViewModel = {
  loading: false,
  collaboratorIds: null,
  collaboratorsMap: new Map<string, CollaboratorItemView>(),
};

@Injectable()
export class CollaboratorsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly collaboratorIds$ = this.select(
    ({ collaboratorIds }) => collaboratorIds
  );
  readonly collaboratorsMap$ = this.select(
    ({ collaboratorsMap }) => collaboratorsMap
  );
  readonly collaborators$ = this.select(
    this.collaboratorsMap$,
    (collaboratorsMap) =>
      Array.from(collaboratorsMap, ([, collaborator]) => collaborator)
  );

  constructor(
    private readonly _collaboratorApiService: CollaboratorApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadCollaborators(this.collaboratorIds$);
  }

  private readonly _setCollaborator = this.updater<CollaboratorItemView>(
    (state, newCollaborator) => {
      const collaboratorsMap = new Map(state.collaboratorsMap);
      collaboratorsMap.set(newCollaborator.document.id, newCollaborator);

      return {
        ...state,
        collaboratorsMap,
      };
    }
  );

  private readonly _patchStatus = this.updater<{
    collaboratorId: string;
    statuses: {
      isCreating?: boolean;
      isUpdating?: boolean;
      isDeleting?: boolean;
    };
  }>((state, { collaboratorId, statuses }) => {
    const collaboratorsMap = new Map(state.collaboratorsMap);
    const collaborator = collaboratorsMap.get(collaboratorId);

    if (collaborator === undefined) {
      return state;
    }

    return {
      ...state,
      collaboratorsMap: collaboratorsMap.set(collaboratorId, {
        ...collaborator,
        ...statuses,
      }),
    };
  });

  private readonly _removeCollaborator = this.updater<string>(
    (state, collaboratorId) => {
      const collaboratorsMap = new Map(state.collaboratorsMap);
      collaboratorsMap.delete(collaboratorId);
      return {
        ...state,
        collaboratorsMap,
      };
    }
  );

  readonly setCollaboratorIds = this.updater<string[] | null>(
    (state, collaboratorIds) => ({
      ...state,
      collaboratorIds,
    })
  );

  private readonly _loadCollaborators = this.effect<string[] | null>(
    switchMap((collaboratorIds) => {
      if (collaboratorIds === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._collaboratorApiService.findByIds(collaboratorIds).pipe(
        tapResponse(
          (collaborators) => {
            this.patchState({
              loading: false,
              collaboratorsMap: collaborators
                .filter(
                  (collaborator): collaborator is Document<Collaborator> =>
                    collaborator !== null
                )
                .reduce(
                  (collaboratorsMap, collaborator) =>
                    collaboratorsMap.set(collaborator.id, {
                      document: collaborator,
                      isCreating: false,
                      isUpdating: false,
                      isDeleting: false,
                    }),
                  new Map<string, CollaboratorItemView>()
                ),
            });
          },
          (error) => this._notificationStore.setError({ error })
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
            this._patchStatus({
              collaboratorId: collaboratorAccountMeta.pubkey,
              statuses: {
                isCreating: false,
              },
            });

            return EMPTY;
          }

          return this._collaboratorApiService
            .findById(collaboratorAccountMeta.pubkey, 'confirmed')
            .pipe(
              isNotNullOrUndefined,
              tapResponse(
                (collaborator) =>
                  this._setCollaborator({
                    document: collaborator,
                    isCreating: true,
                    isUpdating: false,
                    isDeleting: false,
                  }),
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'updateCollaborator': {
          if (instructionStatus.status === 'finalized') {
            this._patchStatus({
              collaboratorId: collaboratorAccountMeta.pubkey,
              statuses: {
                isUpdating: false,
              },
            });

            return EMPTY;
          }

          return this._collaboratorApiService
            .findById(collaboratorAccountMeta.pubkey, 'confirmed')
            .pipe(
              isNotNullOrUndefined,
              tapResponse(
                (collaborator) =>
                  this._setCollaborator({
                    document: collaborator,
                    isCreating: false,
                    isUpdating: true,
                    isDeleting: false,
                  }),
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'deleteCollaborator': {
          if (instructionStatus.status === 'confirmed') {
            this._patchStatus({
              collaboratorId: collaboratorAccountMeta.pubkey,
              statuses: { isDeleting: true },
            });
          } else {
            this._removeCollaborator(collaboratorAccountMeta.pubkey);
          }

          return EMPTY;
        }
        default:
          return EMPTY;
      }
    })
  );
}
