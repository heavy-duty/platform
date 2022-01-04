import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getFiltersByWorkspace, getProgramAccounts } from '../../operations';
import { Application, APPLICATION_ACCOUNT_NAME, Document } from '../../utils';
import { createApplicationDocument } from './utils';

export const getApplicationsByWorkspace = (
  connection: Connection,
  workspacePublicKey: PublicKey
): Observable<Document<Application>[]> => {
  return getProgramAccounts(connection, {
    commitment: connection.commitment,
    filters: getFiltersByWorkspace(
      APPLICATION_ACCOUNT_NAME,
      workspacePublicKey
    ),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createApplicationDocument(pubkey, account)
      )
    )
  );
};
