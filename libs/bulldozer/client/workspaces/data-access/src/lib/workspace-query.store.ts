import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { WorkspaceFilters } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { WorkspaceApiService } from './workspace-api.service';

interface ViewModel {
  loading: boolean;
  workspaceIds: string[] | null;
  filters: WorkspaceFilters | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  workspaceIds: null,
  error: null,
};

@Injectable()
export class WorkspaceQueryStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly workspaceIds$ = this.select(({ workspaceIds }) => workspaceIds);

  constructor(
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadWorkspaceIds(this.filters$);
  }

  readonly addWorkspace = this.updater<string>((state, newWorkspaceId) => ({
    ...state,
    workspaceIds: [...(state.workspaceIds ?? []), newWorkspaceId],
  }));

  readonly removeWorkspaceId = this.updater<string>(
    (state, workspaceIdToRemove) => ({
      ...state,
      workspaceIds:
        state.workspaceIds?.filter(
          (workspaceId) => workspaceId !== workspaceIdToRemove
        ) ?? null,
    })
  );

  readonly setFilters = this.updater<WorkspaceFilters | null>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );

  private readonly _loadWorkspaceIds = this.effect<WorkspaceFilters | null>(
    switchMap((filters) => {
      if (filters === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._workspaceApiService.findIds(filters).pipe(
        tapResponse(
          (workspaceIds) => {
            this.patchState({
              workspaceIds,
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
