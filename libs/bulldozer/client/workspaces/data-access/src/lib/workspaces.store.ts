import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { Document, Workspace } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, merge, switchMap, takeWhile } from 'rxjs';
import { WorkspaceApiService } from './workspace-api.service';
import { WorkspaceEventService } from './workspace-event.service';

interface ViewModel {
  loading: boolean;
  workspaceIds: string[] | null;
  workspacesMap: Map<string, Document<Workspace>>;
}

const initialState: ViewModel = {
  loading: false,
  workspaceIds: null,
  workspacesMap: new Map<string, Document<Workspace>>(),
};

@Injectable()
export class WorkspacesStore extends ComponentStore<ViewModel> {
  readonly workspaceIds$ = this.select(({ workspaceIds }) => workspaceIds);
  readonly workspacesMap$ = this.select(({ workspacesMap }) => workspacesMap);
  readonly workspaces$ = this.select(this.workspacesMap$, (workspacesMap) =>
    Array.from(workspacesMap, ([, workspace]) => workspace)
  );

  constructor(
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _workspaceEventService: WorkspaceEventService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadWorkspaces(this.workspaceIds$);
    this._handleWorkspaceChanges(this.workspaceIds$);
  }

  private readonly _setWorkspace = this.updater<Document<Workspace>>(
    (state, newWorkspace) => {
      const workspacesMap = new Map(state.workspacesMap);
      workspacesMap.set(newWorkspace.id, newWorkspace);
      return {
        ...state,
        workspacesMap,
      };
    }
  );

  private readonly _removeWorkspace = this.updater<string>(
    (state, workspaceId) => {
      const workspacesMap = new Map(state.workspacesMap);
      workspacesMap.delete(workspaceId);
      return {
        ...state,
        workspacesMap,
      };
    }
  );

  private readonly _handleWorkspaceChanges = this.effect<string[] | null>(
    switchMap((workspaceIds) => {
      if (workspaceIds === null) {
        return EMPTY;
      }

      return merge(
        ...workspaceIds.map((workspaceId) =>
          this._workspaceEventService.workspaceChanges(workspaceId).pipe(
            tapResponse(
              (changes) => {
                if (changes === null) {
                  this._removeWorkspace(workspaceId);
                } else {
                  this._setWorkspace(changes);
                }
              },
              (error) => this._notificationStore.setError(error)
            ),
            takeWhile((workspace) => workspace !== null)
          )
        )
      );
    })
  );

  private readonly _loadWorkspaces = this.effect<string[] | null>(
    switchMap((workspaceIds) => {
      if (workspaceIds === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._workspaceApiService.findByIds(workspaceIds).pipe(
        tapResponse(
          (workspaces) =>
            this.patchState({
              workspacesMap: workspaces
                .filter(
                  (workspace): workspace is Document<Workspace> =>
                    workspace !== null
                )
                .reduce(
                  (workspacesMap, workspace) =>
                    workspacesMap.set(workspace.id, workspace),
                  new Map<string, Document<Workspace>>()
                ),
              loading: false,
            }),
          (error) => this._notificationStore.setError({ error })
        )
      );
    })
  );

  readonly setWorkspaceIds = this.updater<string[] | null>(
    (state, workspaceIds) => ({
      ...state,
      workspaceIds,
    })
  );
}
