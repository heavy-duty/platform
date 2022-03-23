import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { Document, Workspace } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, switchMap } from 'rxjs';
import { WorkspaceApiService } from './workspace-api.service';

export interface WorkspaceView {
  document: Document<Workspace>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

interface ViewModel {
  loading: boolean;
  workspaceIds: string[] | null;
  workspacesMap: Map<string, WorkspaceView>;
}

const initialState: ViewModel = {
  loading: false,
  workspaceIds: null,
  workspacesMap: new Map<string, WorkspaceView>(),
};

@Injectable()
export class WorkspacesStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly workspaceIds$ = this.select(({ workspaceIds }) => workspaceIds);
  readonly workspacesMap$ = this.select(({ workspacesMap }) => workspacesMap);
  readonly workspaces$ = this.select(this.workspacesMap$, (workspacesMap) =>
    Array.from(workspacesMap, ([, workspace]) => workspace)
  );

  constructor(
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadWorkspaces(this.workspaceIds$);
  }

  private readonly _setWorkspace = this.updater<WorkspaceView>(
    (state, newWorkspace) => {
      const workspacesMap = new Map(state.workspacesMap);
      workspacesMap.set(newWorkspace.document.id, newWorkspace);

      return {
        ...state,
        workspacesMap,
      };
    }
  );

  private readonly _patchWorkspaceStatuses = this.updater<{
    workspaceId: string;
    statuses: {
      isCreating?: boolean;
      isUpdating?: boolean;
      isDeleting?: boolean;
    };
  }>((state, { workspaceId, statuses }) => {
    const workspacesMap = new Map(state.workspacesMap);
    const workspace = workspacesMap.get(workspaceId);

    if (workspace === undefined) {
      return state;
    }

    return {
      ...state,
      workspacesMap: workspacesMap.set(workspaceId, {
        ...workspace,
        ...statuses,
      }),
    };
  });

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

  private readonly _loadWorkspaces = this.effect<string[] | null>(
    switchMap((workspaceIds) => {
      if (workspaceIds === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._workspaceApiService.findByIds(workspaceIds).pipe(
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
                    workspacesMap.set(workspace.id, {
                      document: workspace,
                      isCreating: false,
                      isUpdating: false,
                      isDeleting: false,
                    }),
                  new Map<string, WorkspaceView>()
                ),
            });
          },
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

  readonly handleWorkspaceInstruction = this.effect<InstructionStatus>(
    concatMap((workspaceInstruction) => {
      const workspaceAccountMeta = workspaceInstruction.accounts.find(
        (account) => account.name === 'Workspace'
      );

      if (workspaceAccountMeta === undefined) {
        return EMPTY;
      }

      switch (workspaceInstruction.name) {
        case 'createWorkspace': {
          if (workspaceInstruction.status === 'finalized') {
            this._patchWorkspaceStatuses({
              workspaceId: workspaceAccountMeta.pubkey,
              statuses: {
                isCreating: false,
              },
            });

            return EMPTY;
          }

          return this._workspaceApiService
            .findById(workspaceAccountMeta.pubkey, 'confirmed')
            .pipe(
              isNotNullOrUndefined,
              tapResponse(
                (workspace) =>
                  this._setWorkspace({
                    document: workspace,
                    isCreating: true,
                    isUpdating: false,
                    isDeleting: false,
                  }),
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'updateWorkspace': {
          if (workspaceInstruction.status === 'finalized') {
            this._patchWorkspaceStatuses({
              workspaceId: workspaceAccountMeta.pubkey,
              statuses: {
                isUpdating: false,
              },
            });

            return EMPTY;
          }

          return this._workspaceApiService
            .findById(workspaceAccountMeta.pubkey, 'confirmed')
            .pipe(
              isNotNullOrUndefined,
              tapResponse(
                (workspace) =>
                  this._setWorkspace({
                    document: workspace,
                    isCreating: false,
                    isUpdating: true,
                    isDeleting: false,
                  }),
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'deleteWorkspace': {
          if (workspaceInstruction.status === 'confirmed') {
            this._patchWorkspaceStatuses({
              workspaceId: workspaceAccountMeta.pubkey,
              statuses: { isDeleting: true },
            });
          } else {
            this._removeWorkspace(workspaceAccountMeta.pubkey);
          }

          return EMPTY;
        }
        default:
          return EMPTY;
      }
    })
  );
}
