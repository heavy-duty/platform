import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { Document, Workspace } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, startWith, switchMap } from 'rxjs';
import { WorkspaceApiService } from './workspace-api.service';
import { WorkspaceEventService } from './workspace-event.service';

interface ViewModel {
  workspaceId: string | null;
  workspace: Document<Workspace> | null;
}

const initialState: ViewModel = {
  workspaceId: null,
  workspace: null,
};

@Injectable()
export class WorkspaceStore extends ComponentStore<ViewModel> {
  readonly workspace$ = this.select(({ workspace }) => workspace);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _workspaceEventService: WorkspaceEventService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadWorkspace(this.workspaceId$);
  }

  private readonly _loadWorkspace = this.effect<string | null>(
    switchMap((workspaceId) => {
      if (workspaceId === null) {
        return EMPTY;
      }

      return this._workspaceApiService
        .findById(workspaceId)
        .pipe(
          concatMap((workspace) =>
            this._workspaceEventService
              .workspaceChanges(workspaceId)
              .pipe(startWith(workspace))
          )
        )
        .pipe(
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
}
