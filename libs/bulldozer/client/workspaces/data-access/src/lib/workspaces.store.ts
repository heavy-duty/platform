import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  Document,
  Workspace,
  WorkspaceFilters,
} from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { List, Map } from 'immutable';
import { EMPTY, switchMap } from 'rxjs';
import { WorkspaceApiService } from './workspace-api.service';

interface ViewModel {
  loading: boolean;
  filters: WorkspaceFilters | null;
  workspaceIds: List<string> | null;
  workspacesMap: Map<string, Document<Workspace>> | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  workspaceIds: null,
  workspacesMap: null,
};

@Injectable()
export class WorkspacesStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly workspaceIds$ = this.select(({ workspaceIds }) => workspaceIds);
  readonly workspacesMap$ = this.select(({ workspacesMap }) => workspacesMap);
  readonly workspaces$ = this.select(this.workspacesMap$, (workspacesMap) =>
    workspacesMap === null
      ? null
      : workspacesMap
          .toList()
          .sort((a, b) => (b.createdAt.lt(a.createdAt) ? 1 : -1))
  );

  constructor(
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadWorkspaces(this.workspaceIds$);
    this._loadWorkspaceIds(this.filters$);
  }

  readonly setFilters = this.updater<WorkspaceFilters | null>(
    (state, filters) => ({
      ...state,
      filters,
      workspaceIds: null,
      workspacesMap: null,
    })
  );

  private readonly _loadWorkspaceIds = this.effect<WorkspaceFilters | null>(
    switchMap((filters) => {
      if (filters === null) {
        return EMPTY;
      }

      this.patchState({
        loading: true,
        workspaceIds: List(),
        workspacesMap: null,
      });

      return this._workspaceApiService.findIds(filters).pipe(
        tapResponse(
          (workspaceIds) => {
            this.patchState({
              workspaceIds: List(workspaceIds),
            });
          },
          (error) => this._notificationStore.setError(error)
        )
      );
    })
  );

  private readonly _loadWorkspaces = this.effect<List<string> | null>(
    switchMap((workspaceIds) => {
      if (workspaceIds === null) {
        return EMPTY;
      }

      return this._workspaceApiService.findByIds(workspaceIds.toArray()).pipe(
        tapResponse(
          (workspaces) => {
            this.patchState({
              loading: false,
              workspacesMap: workspaces
                .filter(
                  (workspace): workspace is Document<Workspace> =>
                    workspace !== null
                )
                .reduce(
                  (workspacesMap, workspace) =>
                    workspacesMap.set(workspace.id, workspace),
                  Map<string, Document<Workspace>>()
                ),
            });
          },
          (error) => this._notificationStore.setError({ error })
        )
      );
    })
  );
}
