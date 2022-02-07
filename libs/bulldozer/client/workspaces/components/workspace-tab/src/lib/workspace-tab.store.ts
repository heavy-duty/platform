import { Injectable } from '@angular/core';
import {
  WorkspaceApiService,
  WorkspaceSocketService,
} from '@bulldozer-client/workspaces-data-access';
import { Document, Workspace } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, of, startWith, switchMap } from 'rxjs';

interface ViewModel {
  workspaceId: string | null;
  workspace: Document<Workspace> | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  workspaceId: null,
  workspace: null,
  error: null,
};

@Injectable()
export class WorkspaceTabStore extends ComponentStore<ViewModel> {
  private readonly _workspaceId$ = this.select(
    ({ workspaceId }) => workspaceId
  );
  readonly workspace$ = this.select(({ workspace }) => workspace);

  constructor(
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _workspaceSocketService: WorkspaceSocketService
  ) {
    super(initialState);
  }

  readonly setWorkspaceId = this.updater(
    (state, workspaceId: string | null) => ({ ...state, workspaceId })
  );

  protected readonly loadWorkspace = this.effect(() =>
    this._workspaceId$.pipe(
      switchMap((workspaceId) => {
        if (workspaceId === null) {
          return of(null);
        }

        return this._workspaceApiService
          .findById(workspaceId)
          .pipe(
            concatMap((workspace) =>
              this._workspaceSocketService
                .workspaceChanges(workspaceId)
                .pipe(startWith(workspace))
            )
          );
      }),
      tapResponse(
        (workspace) => this.patchState({ workspace }),
        (error) => this.patchState({ error })
      )
    )
  );
}
