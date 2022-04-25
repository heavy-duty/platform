import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { CollaboratorFilters } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { CollaboratorApiService } from './collaborator-api.service';

interface ViewModel {
  loading: boolean;
  collaboratorIds: string[] | null;
  filters: CollaboratorFilters | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  collaboratorIds: null,
  error: null,
};

@Injectable()
export class CollaboratorQueryStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly collaboratorIds$ = this.select(
    ({ collaboratorIds }) => collaboratorIds
  );

  constructor(
    private readonly _collaboratorApiService: CollaboratorApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadCollaboratorIds(this.filters$);
  }

  readonly addCollaborator = this.updater<string>(
    (state, newCollaboratorId) => ({
      ...state,
      collaboratorIds: [...(state.collaboratorIds ?? []), newCollaboratorId],
    })
  );

  readonly removeCollaboratorId = this.updater<string>(
    (state, collaboratorIdToRemove) => ({
      ...state,
      collaboratorIds:
        state.collaboratorIds?.filter(
          (collaboratorId) => collaboratorId !== collaboratorIdToRemove
        ) ?? null,
    })
  );

  readonly setFilters = this.updater<CollaboratorFilters | null>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );

  private readonly _loadCollaboratorIds =
    this.effect<CollaboratorFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        this.patchState({ loading: true });

        return this._collaboratorApiService.findIds(filters).pipe(
          tapResponse(
            (collaboratorIds) => {
              this.patchState({
                collaboratorIds,
                loading: false,
              });
            },
            (error) => {
              this.patchState({
                error,
                loading: false,
              });
              this._notificationStore.setError(error);
            }
          )
        );
      })
    );
}
