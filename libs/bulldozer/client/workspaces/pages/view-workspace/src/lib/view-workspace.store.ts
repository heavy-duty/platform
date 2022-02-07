import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notification-store';
import {
  WorkspaceApiService,
  WorkspaceSocketService,
} from '@bulldozer-client/workspaces-data-access';
import { Document, Workspace } from '@heavy-duty/bulldozer-devkit';
import { TabStore } from '@heavy-duty/bulldozer/application/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rx-solana';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, of, startWith, switchMap, tap } from 'rxjs';
import { ViewWorkspaceRouteStore } from './view-workspace-route.store';

interface ViewModel {
  workspace: Document<Workspace> | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  workspace: null,
  error: null,
};

@Injectable()
export class ViewWorkspaceStore extends ComponentStore<ViewModel> {
  readonly workspace$ = this.select(({ workspace }) => workspace);

  constructor(
    private readonly _tabStore: TabStore,
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _workspaceSocketService: WorkspaceSocketService,
    private readonly _viewWorkspaceRouteStore: ViewWorkspaceRouteStore,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);
  }

  protected readonly loadWorkspace = this.effect(() =>
    this._viewWorkspaceRouteStore.workspaceId$.pipe(
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
        (error) => this._notificationStore.setError({ error })
      )
    )
  );

  protected readonly openTab = this.effect(() =>
    this.workspace$.pipe(
      isNotNullOrUndefined,
      tap((workspace) =>
        this._tabStore.openTab({
          id: workspace.id,
          kind: 'workspace',
          url: `/workspaces/${workspace.id}`,
        })
      )
    )
  );
}
