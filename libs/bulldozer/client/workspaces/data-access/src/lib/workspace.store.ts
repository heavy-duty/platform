import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { Document, Workspace } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  map,
  switchMap,
  tap,
} from 'rxjs';
import { WorkspaceApiService } from './workspace-api.service';
import { InstructionStatus } from './workspace-instructions.store';

interface ViewModel {
  workspaceId: string | null;
  workspace: Document<Workspace> | null;
  isUpdating: boolean;
  isDeleting: boolean;
}

const initialState: ViewModel = {
  workspaceId: null,
  workspace: null,
  isUpdating: false,
  isDeleting: false,
};

@Injectable()
export class WorkspaceStore extends ComponentStore<ViewModel> {
  private readonly _reload = new BehaviorSubject(null);
  private readonly reload$ = this._reload.asObservable();
  readonly workspace$ = this.select(({ workspace }) => workspace);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly isUpdating$ = this.select(({ isUpdating }) => isUpdating);
  readonly isDeleting$ = this.select(({ isDeleting }) => isDeleting);

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
        return EMPTY;
      }

      return this._workspaceApiService.findById(workspaceId).pipe(
        tapResponse(
          (workspace) => this.patchState({ workspace }),
          (error) => this._notificationStore.setError({ error })
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
    tap((workspaceInstruction) => {
      switch (workspaceInstruction.name) {
        case 'updateWorkspace': {
          if (workspaceInstruction.status === 'confirmed') {
            this.patchState({ isUpdating: true });
            this.reload();
          } else {
            this.patchState({ isUpdating: false });
          }

          break;
        }
        case 'deleteWorkspace': {
          if (workspaceInstruction.status === 'confirmed') {
            this.patchState({ isDeleting: true });
          } else {
            this.patchState({ workspace: null, isDeleting: false });
          }

          break;
        }
      }
    })
  );

  reload() {
    this._reload.next(null);
  }
}
