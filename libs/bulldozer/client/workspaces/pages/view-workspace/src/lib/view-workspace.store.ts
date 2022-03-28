import { Injectable } from '@angular/core';
import { BudgetStore } from '@bulldozer-client/budgets-data-access';
import {
  CollaboratorsStore,
  CollaboratorStore,
} from '@bulldozer-client/collaborators-data-access';
import { ConfigStore, TabStore } from '@bulldozer-client/core-data-access';
import { UserStore } from '@bulldozer-client/users-data-access';
import { WorkspaceStore } from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest, tap } from 'rxjs';

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
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _collaboratorsStore: CollaboratorsStore,
    private readonly _collaboratorStore: CollaboratorStore,
    private readonly _userStore: UserStore,
    private readonly _budgetStore: BudgetStore,
    private readonly _configStore: ConfigStore
  ) {
    super(initialState);

    this._workspaceStore.setWorkspaceId(this.workspaceId$);
    this._collaboratorStore.setWorkspaceId(this.workspaceId$);
    this._collaboratorStore.setUserId(this._userStore.userId$);
    this._collaboratorsStore.setFilters(
      combineLatest({
        workspace: this.workspaceId$.pipe(isNotNullOrUndefined),
      })
    );
    this._budgetStore.setWorkspaceId(this.workspaceId$);
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
