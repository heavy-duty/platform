import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { Document, Workspace } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  EMPTY,
  map,
  switchMap,
} from 'rxjs';
import { ItemView } from './types';
import { WorkspaceApiService } from './workspace-api.service';
import { InstructionStatus } from './workspace-instructions.store';

export type WorkspaceView = ItemView<Document<Workspace>>;

interface ViewModel {
  workspaceId: string | null;
  workspace: WorkspaceView | null;
  loading: boolean;
}

const initialState: ViewModel = {
  workspaceId: null,
  workspace: null,
  loading: false,
};

@Injectable()
export class WorkspaceStore extends ComponentStore<ViewModel> {
  private readonly _reload = new BehaviorSubject(null);
  private readonly reload$ = this._reload.asObservable();
  readonly workspace$ = this.select(({ workspace }) => workspace);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly loading$ = this.select(({ loading }) => loading);

  constructor(
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadWorkspace(
      combineLatest([this.workspaceId$, this.reload$]).pipe(
        map(([workspaceId]) => workspaceId)
      )
    );
  }

  private readonly _loadWorkspace = this.effect<string | null>(
    switchMap((workspaceId) => {
      if (workspaceId === null) {
        this.patchState({ workspace: null });
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._workspaceApiService.findById(workspaceId).pipe(
        tapResponse(
          (workspace) => {
            if (workspace !== null) {
              this._setWorkspace({
                document: workspace,
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

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({
      ...state,
      workspaceId,
    })
  );

  private readonly _patchWorkspaceStatuses = this.updater<{
    isCreating?: boolean;
    isUpdating?: boolean;
    isDeleting?: boolean;
  }>((state, statuses) => ({
    ...state,
    workspace: state.workspace
      ? {
          ...state.workspace,
          ...statuses,
        }
      : null,
  }));

  private readonly _setWorkspace = this.updater<WorkspaceView | null>(
    (state, workspace) => ({
      ...state,
      workspace,
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
            this._patchWorkspaceStatuses({ isCreating: false });
            return EMPTY;
          }

          return this._workspaceApiService
            .findById(workspaceAccountMeta.pubkey, 'confirmed')
            .pipe(
              tapResponse(
                (workspace) => {
                  if (workspace !== null) {
                    this._setWorkspace({
                      document: workspace,
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
        case 'updateWorkspace': {
          if (workspaceInstruction.status === 'finalized') {
            this._patchWorkspaceStatuses({ isUpdating: false });
            return EMPTY;
          }

          return this._workspaceApiService
            .findById(workspaceAccountMeta.pubkey, 'confirmed')
            .pipe(
              tapResponse(
                (workspace) => {
                  if (workspace !== null) {
                    this._setWorkspace({
                      document: workspace,
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
        case 'deleteWorkspace': {
          if (workspaceInstruction.status === 'confirmed') {
            this._patchWorkspaceStatuses({ isDeleting: true });
          } else {
            this._patchWorkspaceStatuses({ isDeleting: false });
            this.patchState({ workspace: null });
          }

          return EMPTY;
        }
        default:
          return EMPTY;
      }
    })
  );

  reload() {
    this._reload.next(null);
  }
}
