import { ReactiveConnection } from '@heavy-duty/rx-solana';
import { Observable } from 'rxjs';
import {
  createWorkspaceDocument,
  Document,
  fromAccountCreated,
  Workspace,
  WorkspaceFilters,
  WORKSPACE_ACCOUNT_NAME,
} from '../../utils';

export const fromWorkspaceCreated = (
  connection: ReactiveConnection,
  filters: WorkspaceFilters
): Observable<Document<Workspace>> =>
  fromAccountCreated(
    connection,
    filters,
    WORKSPACE_ACCOUNT_NAME,
    createWorkspaceDocument
  );
