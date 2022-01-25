import { Injectable } from '@angular/core';
import { WorkspaceStore } from '@heavy-duty/bulldozer-store';
import { ComponentStore } from '@ngrx/component-store';

interface ViewModel {
  workspaceId?: string;
}

const initialState = {};

@Injectable()
export class WorkspaceSelectorStore extends ComponentStore<ViewModel> {
  readonly workspace$ = this.select(
    this.select(({ workspaceId }) => workspaceId),
    this._workspaceStore.workspaces$,
    (workspaceId, workspaces) =>
      workspaces.find((workspace) => workspace.id === workspaceId)
  );

  constructor(private readonly _workspaceStore: WorkspaceStore) {
    super(initialState);
  }

  readonly setWorkspaceId = this.updater(
    (state, workspaceId: string | undefined) => ({
      ...state,
      workspaceId,
    })
  );
}
