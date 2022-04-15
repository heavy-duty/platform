import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  Collaborator,
  CollaboratorFilters,
  Document,
} from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { List, Map } from 'immutable';
import { EMPTY, switchMap } from 'rxjs';
import { CollaboratorApiService } from './collaborator-api.service';

interface ViewModel {
  loading: boolean;
  filters: CollaboratorFilters | null;
  collaboratorIds: List<string> | null;
  collaboratorsMap: Map<string, Document<Collaborator>> | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  collaboratorIds: null,
  collaboratorsMap: null,
};

@Injectable()
export class CollaboratorsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly collaboratorIds$ = this.select(
    ({ collaboratorIds }) => collaboratorIds
  );
  readonly collaboratorsMap$ = this.select(
    ({ collaboratorsMap }) => collaboratorsMap
  );
  readonly collaborators$ = this.select(
    this.collaboratorsMap$,
    (collaboratorsMap) =>
      collaboratorsMap === null
        ? null
        : collaboratorsMap
            .toList()
            .sort((a, b) => (b.createdAt.lt(a.createdAt) ? 1 : -1))
  );

  constructor(
    private readonly _collaboratorApiService: CollaboratorApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadCollaborators(this.collaboratorIds$);
    this._loadCollaboratorIds(this.filters$);
  }

  readonly setFilters = this.updater<CollaboratorFilters | null>(
    (state, filters) => ({
      ...state,
      filters,
      collaboratorIds: null,
      collaboratorsMap: null,
    })
  );

  private readonly _loadCollaboratorIds =
    this.effect<CollaboratorFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        this.patchState({
          loading: true,
          collaboratorIds: List(),
          collaboratorsMap: null,
        });

        return this._collaboratorApiService.findIds(filters).pipe(
          tapResponse(
            (collaboratorIds) => {
              this.patchState({
                collaboratorIds: List(collaboratorIds),
              });
            },
            (error) => this._notificationStore.setError(error)
          )
        );
      })
    );

  private readonly _loadCollaborators = this.effect<List<string> | null>(
    switchMap((collaboratorIds) => {
      if (collaboratorIds === null) {
        return EMPTY;
      }

      return this._collaboratorApiService
        .findByIds(collaboratorIds.toArray())
        .pipe(
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
                      collaboratorsMap.set(collaborator.id, collaborator),
                    Map<string, Document<Collaborator>>()
                  ),
              });
            },
            (error) => this._notificationStore.setError({ error })
          )
        );
    })
  );
}
