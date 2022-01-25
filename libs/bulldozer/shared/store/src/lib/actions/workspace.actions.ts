import {
  Action,
  WORKSPACE_CREATED,
  WORKSPACE_DELETED,
  WORKSPACE_UPDATED,
} from './types';

export class WorkspaceCreated implements Action<void> {
  type: typeof WORKSPACE_CREATED = WORKSPACE_CREATED;
}

export class WorkspaceUpdated implements Action<string> {
  type: typeof WORKSPACE_UPDATED = WORKSPACE_UPDATED;

  constructor(public payload: string) {}
}

export class WorkspaceDeleted implements Action<string> {
  type: typeof WORKSPACE_DELETED = WORKSPACE_DELETED;

  constructor(public payload: string) {}
}

export type WorkspaceActions =
  | WorkspaceCreated
  | WorkspaceUpdated
  | WorkspaceDeleted;
