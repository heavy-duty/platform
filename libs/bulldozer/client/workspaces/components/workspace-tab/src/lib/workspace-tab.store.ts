import { Injectable } from '@angular/core';
import { TabStore } from '@bulldozer-client/core-data-access';
import { WorkspaceStore } from '@bulldozer-client/workspaces-data-access';
import { Document, Workspace } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore } from '@ngrx/component-store';
import { filter, pairwise, pipe, tap } from 'rxjs';

@Injectable()
export class WorkspaceTabStore extends ComponentStore<object> {
  constructor(
    private readonly _tabStore: TabStore,
    workspaceStore: WorkspaceStore
  ) {
    super({});

    this._handleWorkspaceDeleted(workspaceStore.workspace$);
  }

  private readonly _handleWorkspaceDeleted =
    this.effect<Document<Workspace> | null>(
      pipe(
        pairwise(),
        filter(
          ([previousWorkspace, currentWorkspace]) =>
            previousWorkspace !== null && currentWorkspace === null
        ),
        tap(([workspace]) => {
          if (workspace !== null) {
            this._tabStore.closeTab(workspace.id);
          }
        })
      )
    );

  closeTab(tabId: string) {
    this._tabStore.closeTab(tabId);
  }
}
