import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getFiltersByWorkspace, getProgramAccounts } from '../../operations';
import { BULLDOZER_PROGRAM_ID } from '../../programs';
import { Collection, COLLECTION_ACCOUNT_NAME, Document } from '../../utils';
import { createCollectionDocument } from './utils';

export const getCollectionsByWorkspace = (
  connection: Connection,
  workspacePublicKey: PublicKey
): Observable<Document<Collection>[]> => {
  return getProgramAccounts(connection, BULLDOZER_PROGRAM_ID, {
    commitment: connection.commitment,
    filters: getFiltersByWorkspace(COLLECTION_ACCOUNT_NAME, workspacePublicKey),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createCollectionDocument(pubkey, account.data)
      )
    )
  );
};