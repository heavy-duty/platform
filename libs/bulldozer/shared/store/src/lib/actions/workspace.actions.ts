import { Document, Workspace } from '@heavy-duty/bulldozer-devkit';
import { Action, WorkspaceActionTypes } from './types';

export class WorkspaceCreated implements Action<void> {
  type = WorkspaceActionTypes.WorkspaceCreated;
}

export class WorkspaceUpdated implements Action<Document<Workspace>> {
  type = WorkspaceActionTypes.WorkspaceUpdated;

  constructor(public payload: Document<Workspace>) {}
}

export class WorkspaceDeleted implements Action<string> {
  type = WorkspaceActionTypes.WorkspaceDeleted;

  constructor(public payload: string) {}
}

export type WorkspaceActions =
  | WorkspaceCreated
  | WorkspaceUpdated
  | WorkspaceDeleted;
