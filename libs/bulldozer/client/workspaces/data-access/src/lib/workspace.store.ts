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
import { WorkspaceApiService } from './workspace-api.service';
import { InstructionStatus } from './workspace-instructions.store';

interface ViewModel {
  workspaceId: string | null;
  workspace: Document<Workspace> | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  loading: boolean;
}

const initialState: ViewModel = {
  workspaceId: null,
  workspace: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  loading: false,
};

@Injectable()
export class WorkspaceStore extends ComponentStore<ViewModel> {
  private readonly _reload = new BehaviorSubject(null);
  private readonly reload$ = this._reload.asObservable();
  readonly workspace$ = this.select(({ workspace }) => workspace);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly isCreating$ = this.select(({ isCreating }) => isCreating);
  readonly isUpdating$ = this.select(({ isUpdating }) => isUpdating);
  readonly isDeleting$ = this.select(({ isDeleting }) => isDeleting);
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
      console.log('loading workspace');

      if (workspaceId === null) {
        this.patchState({ workspace: null });
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._workspaceApiService.findById(workspaceId).pipe(
        tapResponse(
          (workspace) => this.patchState({ workspace, loading: false }),
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
            this.patchState({ isCreating: false });
            return EMPTY;
          }

          return this._workspaceApiService
            .findById(workspaceAccountMeta.pubkey, 'confirmed')
            .pipe(
              tapResponse(
                (workspace) => {
                  console.log(workspace);

                  this.patchState({
                    workspace,
                    isCreating: true,
                  });
                },
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'updateWorkspace': {
          if (workspaceInstruction.status === 'finalized') {
            this.patchState({ isUpdating: false });
            return EMPTY;
          }

          return this._workspaceApiService
            .findById(workspaceAccountMeta.pubkey, 'confirmed')
            .pipe(
              tapResponse(
                (workspace) =>
                  this.patchState({
                    workspace,
                    isUpdating: true,
                  }),
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'deleteWorkspace': {
          if (workspaceInstruction.status === 'confirmed') {
            this.patchState({ isDeleting: true });
          } else {
            this.patchState({ workspace: null, isDeleting: false });
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
