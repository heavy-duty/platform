import { Action, WorkspaceActionTypes } from './types';

export class WorkspaceInit implements Action<void> {
  type = WorkspaceActionTypes.WorkspaceInit;
}

export class WorkspaceCreated implements Action<void> {
  type = WorkspaceActionTypes.WorkspaceCreated;
}

export class WorkspaceUpdated implements Action<string> {
  type = WorkspaceActionTypes.WorkspaceUpdated;

  constructor(public payload: string) {}
}

export class WorkspaceDeleted implements Action<string> {
  type = WorkspaceActionTypes.WorkspaceDeleted;

  constructor(public payload: string) {}
}

export class WorkspaceDownloaded implements Action<string> {
  type = WorkspaceActionTypes.WorkspaceDonwloaded;

  constructor(public payload: string) {}
}

export type WorkspaceActions =
  | WorkspaceInit
  | WorkspaceCreated
  | WorkspaceUpdated
  | WorkspaceDeleted
  | WorkspaceDownloaded;
