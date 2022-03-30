import { Injectable } from '@angular/core';
import { ConfigStore, TabStore } from '@bulldozer-client/core-data-access';
import { WorkspaceStore } from '@bulldozer-client/workspaces-data-access';
import { ComponentStore } from '@ngrx/component-store';
import { tap } from 'rxjs';

interface ViewModel {
  workspaceId: string | null;
}

const initialState: ViewModel = {
  workspaceId: null,
};

@Injectable()
export class ViewWorkspaceStore extends ComponentStore<ViewModel> {
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(
    private readonly _tabStore: TabStore,
    private readonly _configStore: ConfigStore,
    private readonly _workspaceStore: WorkspaceStore
  ) {
    super(initialState);

    this._workspaceStore.setWorkspaceId(this.workspaceId$);
    this._openTab(this.workspaceId$);
    this._activateWorkspace(this.workspaceId$);
  }

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({ ...state, workspaceId })
  );

  private readonly _activateWorkspace = this.effect<string | null>(
    tap((workspaceId) => this._configStore.setWorkspaceId(workspaceId))
  );

  private readonly _openTab = this.effect<string | null>(
    tap((workspaceId) => {
      if (workspaceId !== null) {
        this._tabStore.openTab({
          id: workspaceId,
          kind: 'workspace',
          url: `/workspaces/${workspaceId}`,
        });
      }
    })
  );
}
