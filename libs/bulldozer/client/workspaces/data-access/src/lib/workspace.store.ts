import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { Document, Workspace } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { WorkspaceApiService } from './workspace-api.service';

interface ViewModel {
  loading: boolean;
  workspaceId: string | null;
  workspace: Document<Workspace> | null;
}

const initialState: ViewModel = {
  loading: false,
  workspaceId: null,
  workspace: null,
};

@Injectable()
export class WorkspaceStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly workspace$ = this.select(({ workspace }) => workspace);

  constructor(
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadWorkspace(this.workspaceId$);
  }

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({
      ...state,
      workspaceId,
    })
  );

  private readonly _loadWorkspace = this.effect<string | null>(
    switchMap((workspaceId) => {
      if (workspaceId === null) {
        return EMPTY;
      }

      this.patchState({ loading: true, workspace: null });

      return this._workspaceApiService.findById(workspaceId).pipe(
        tapResponse(
          (workspace) => {
            this.patchState({
              loading: false,
              workspace,
            });
          },
          (error) => this._notificationStore.setError({ error })
        )
      );
    })
  );
}
