import { getProgramAccounts } from '@heavy-duty/rx-solana';
import { Connection } from '@solana/web3.js';
import { map, Observable } from 'rxjs';
import {
  BULLDOZER_PROGRAM_ID,
  createWorkspaceDocument,
  Document,
  encodeFilters,
  Workspace,
  WorkspaceFilters,
  WORKSPACE_ACCOUNT_NAME,
} from '../../utils';

export const getWorkspaces = (
  connection: Connection,
  filters: WorkspaceFilters
): Observable<Document<Workspace>[]> => {
  return getProgramAccounts(connection, BULLDOZER_PROGRAM_ID, {
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
