import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  Collaborator,
  CollaboratorFilters,
  Document,
} from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  filter,
  first,
  mergeMap,
  of,
  pipe,
  switchMap,
  takeUntil,
  takeWhile,
  withLatestFrom,
} from 'rxjs';
import { CollaboratorApiService } from './collaborator-api.service';
import { CollaboratorEventService } from './collaborator-event.service';

interface ViewModel {
  loading: boolean;
  collaboratorsMap: Map<string, Document<Collaborator>>;
  filters: CollaboratorFilters | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  collaboratorsMap: new Map<string, Document<Collaborator>>(),
};

@Injectable()
export class CollaboratorsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly collaboratorsMap$ = this.select(
    ({ collaboratorsMap }) => collaboratorsMap
  );
  readonly collaborators$ = this.select(
    this.collaboratorsMap$,
    (collaboratorsMap) =>
      Array.from(collaboratorsMap, ([, collaborator]) => collaborator)
  );

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _collaboratorApiService: CollaboratorApiService,
    private readonly _collaboratorEventService: CollaboratorEventService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._handleCollaboratorCreated(this.filters$);
    this._loadCollaborators(this.filters$);
  }

  private readonly _setCollaborator = this.updater<Document<Collaborator>>(
    (state, newCollaborator) => {
      const collaboratorsMap = new Map(state.collaboratorsMap);
      collaboratorsMap.set(newCollaborator.id, newCollaborator);
      return {
        ...state,
        collaboratorsMap,
      };
    }
  );

  private readonly _addCollaborator = this.updater<Document<Collaborator>>(
    (state, newCollaborator) => {
      if (state.collaboratorsMap.has(newCollaborator.id)) {
        return state;
      }
      const collaboratorsMap = new Map(state.collaboratorsMap);
      collaboratorsMap.set(newCollaborator.id, newCollaborator);
      return {
        ...state,
        collaboratorsMap,
      };
    }
  );

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

  private readonly _handleCollaboratorChanges = this.effect<string>(
    mergeMap((collaboratorId) =>
      this._collaboratorEventService.collaboratorChanges(collaboratorId).pipe(
        tapResponse(
          (changes) => {
            if (changes === null) {
              this._removeCollaborator(collaboratorId);
            } else {
              this._setCollaborator(changes);
            }
          },
          (error) => this._notificationStore.setError(error)
        ),
        takeUntil(
          this.loading$.pipe(
            filter((loading) => loading),
            first()
          )
        ),
        takeWhile((collaborator) => collaborator !== null)
      )
    )
  );

  private readonly _handleCollaboratorCreated =
    this.effect<CollaboratorFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        return this._collaboratorEventService.collaboratorCreated(filters).pipe(
          tapResponse(
            (collaborator) => {
              this._addCollaborator(collaborator);
              this._handleCollaboratorChanges(collaborator.id);
            },
            (error) => this._notificationStore.setError(error)
          )
        );
      })
    );

  private readonly _loadCollaborators = this.effect<CollaboratorFilters | null>(
    switchMap((filters) => {
      if (filters === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._collaboratorApiService.find(filters).pipe(
        tapResponse(
          (collaborators) => {
            this.patchState({
              collaboratorsMap: collaborators.reduce(
                (collaboratorsMap, collaborator) =>
                  collaboratorsMap.set(collaborator.id, collaborator),
                new Map<string, Document<Collaborator>>()
              ),
              loading: false,
            });
            collaborators.forEach(({ id }) =>
              this._handleCollaboratorChanges(id)
            );
          },
          (error) => this._notificationStore.setError(error)
        )
      );
    })
  );

  readonly setFilters = this.updater<CollaboratorFilters | null>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );

  readonly createCollaborator = this.effect<{
    workspaceId: string;
    userId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ workspaceId, userId }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._collaboratorApiService
          .create({
            authority: authority.toBase58(),
            workspaceId,
            userId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Create collaborator request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );

  readonly deleteCollaborator = this.effect<{
    workspaceId: string;
    collaboratorId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ collaboratorId, workspaceId }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._collaboratorApiService
          .delete({
            authority: authority.toBase58(),
            collaboratorId,
            workspaceId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Delete collaborator request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );
}
