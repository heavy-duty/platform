import { getAccountInfo } from '@heavy-duty/rx-solana';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createWorkspaceDocument, Document, Workspace } from '../../utils';

export const getWorkspace = (
  connection: Connection,
  workspacePublicKey: PublicKey
): Observable<Document<Workspace> | null> => {
  return getAccountInfo(connection, workspacePublicKey).pipe(
    map(
      (account) =>
        account && createWorkspaceDocument(workspacePublicKey, account)
    )
  );
};
