import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getFiltersByAuthority, getProgramAccounts } from '../../operations';
import { Document, Workspace, WORKSPACE_ACCOUNT_NAME } from '../../utils';
import { createWorkspaceDocument } from './utils';

export const getWorkspacesByAuthority = (
  connection: Connection,
  authority: PublicKey
): Observable<Document<Workspace>[]> => {
  return getProgramAccounts(connection, {
    commitment: connection.commitment,
    filters: getFiltersByAuthority(WORKSPACE_ACCOUNT_NAME, authority),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createWorkspaceDocument(pubkey, account)
      )
    )
  );
};
