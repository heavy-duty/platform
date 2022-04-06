import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { Document, Workspace } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, Observable, switchMap } from 'rxjs';
import { ItemView } from './types';
import { WorkspaceApiService } from './workspace-api.service';
import { WorkspaceInstructionsStore } from './workspace-instructions.store';

export type WorkspaceItemView = ItemView<Document<Workspace>>;

interface ItemStatus {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

interface ViewModel {
  loading: boolean;
  workspaceIds: string[] | null;
  workspacesMap: Map<string, Document<Workspace>>;
  workspaceStatusesMap: Map<string, ItemStatus>;
}

const initialState: ViewModel = {
  loading: false,
  workspaceIds: null,
  workspacesMap: new Map<string, Document<Workspace>>(),
  workspaceStatusesMap: new Map<string, ItemStatus>(),
};

@Injectable()
export class WorkspacesStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly workspaceIds$ = this.select(({ workspaceIds }) => workspaceIds);
  readonly workspacesMap$ = this.select(({ workspacesMap }) => workspacesMap);
  readonly workspaceStatusesMap$ = this.select(
    ({ workspaceStatusesMap }) => workspaceStatusesMap
  );
  readonly workspaces$: Observable<WorkspaceItemView[]> = this.select(
    this.workspacesMap$,
    this.workspaceStatusesMap$,
    (workspacesMap, workspaceStatusesMap) =>
      Array.from(workspacesMap, ([workspaceId, workspace]) => ({
        document: workspace,
        ...(workspaceStatusesMap.get(workspaceId) ?? {
          isCreating: false,
          isUpdating: false,
          isDeleting: false,
        }),
      }))
  );

  constructor(
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _notificationStore: NotificationStore,
    private readonly _workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._loadWorkspaces(this.workspaceIds$);
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

  private readonly _setWorkspacesMap = this.updater<
    Map<string, Document<Workspace>>
  >((state, newWorkspacesMap) => {
    const workspacesMap = new Map(state.workspacesMap);

    newWorkspacesMap.forEach((newWorkspace) => {
      workspacesMap.set(newWorkspace.id, newWorkspace);
    });

    return { ...state, workspacesMap };
  });

  private readonly _patchStatus = this.updater<{
    workspaceId: string;
    statuses: {
      isCreating?: boolean;
      isUpdating?: boolean;
      isDeleting?: boolean;
    };
  }>((state, { workspaceId, statuses }) => {
    const workspaceStatusesMap = new Map(state.workspaceStatusesMap);
    const workspaceStatus = workspaceStatusesMap.get(workspaceId);

    return {
      ...state,
      workspaceStatusesMap: workspaceStatusesMap.set(workspaceId, {
        ...(workspaceStatus === undefined
          ? { isCreating: false, isUpdating: false, isDeleting: false }
          : workspaceStatus),
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
            this._setWorkspacesMap(
              workspaces
                .filter(
                  (workspace): workspace is Document<Workspace> =>
                    workspace !== null
                )
                .reduce(
                  (workspacesMap, workspace) =>
                    workspacesMap.set(workspace.id, workspace),
                  new Map<string, Document<Workspace>>()
                )
            );
            this.patchState({
              loading: false,
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

  readonly dispatch = this.effect<InstructionStatus>(
    concatMap((instructionStatus) => {
      const workspaceAccountMeta = instructionStatus.accounts.find(
        (account) => account.name === 'Workspace'
      );

      if (workspaceAccountMeta === undefined) {
        return EMPTY;
      }

      switch (instructionStatus.name) {
        case 'createWorkspace': {
          if (instructionStatus.status === 'finalized') {
            this._patchStatus({
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
                (workspace) => {
                  this._setWorkspace(workspace);
                  this._patchStatus({
                    workspaceId: workspaceAccountMeta.pubkey,
                    statuses: {
                      isCreating: true,
                    },
                  });
                },
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'updateWorkspace': {
          if (instructionStatus.status === 'finalized') {
            this._patchStatus({
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
                (workspace) => {
                  this._setWorkspace(workspace);
                  this._patchStatus({
                    workspaceId: workspaceAccountMeta.pubkey,
                    statuses: {
                      isUpdating: true,
                    },
                  });
                },
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'deleteWorkspace': {
          if (instructionStatus.status === 'confirmed') {
            this._patchStatus({
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
