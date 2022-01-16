import { Observable } from 'rxjs';
import { fromDocumentCreated } from '../../operations';
import { ReactiveConnection } from '../../reactive-connection';
import {
  Document,
  Workspace,
  WorkspaceFilters,
  WORKSPACE_ACCOUNT_NAME,
} from '../../utils';
import { createWorkspaceDocument } from './utils';

export const fromWorkspaceCreated = (
  connection: ReactiveConnection,
  filters: WorkspaceFilters
): Observable<Document<Workspace>> =>
  fromDocumentCreated(
    connection,
    filters,
    WORKSPACE_ACCOUNT_NAME,
    createWorkspaceDocument
  );
