import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getAccountInfo } from '../../operations';
import { Document, Workspace } from '../../utils';
import { createWorkspaceDocument } from './utils';

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
