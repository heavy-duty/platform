import { Connection } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { encodeFilters, getProgramAccounts } from '../../operations';
import {
  Document,
  Workspace,
  WorkspaceFilters,
  WORKSPACE_ACCOUNT_NAME,
} from '../../utils';
import { createWorkspaceDocument } from './utils';

export const getWorkspaces = (
  connection: Connection,
  filters: WorkspaceFilters
): Observable<Document<Workspace>[]> => {
  return getProgramAccounts(connection, {
    commitment: connection.commitment,
    filters: encodeFilters(WORKSPACE_ACCOUNT_NAME, filters),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createWorkspaceDocument(pubkey, account)
      )
    )
  );
};
