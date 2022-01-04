import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getFiltersByApplication, getProgramAccounts } from '../../operations';
import { Collection, COLLECTION_ACCOUNT_NAME, Document } from '../../utils';
import { createCollectionDocument } from './utils';

export const getCollectionsByApplication = (
  connection: Connection,
  applicationPublicKey: PublicKey
): Observable<Document<Collection>[]> => {
  return getProgramAccounts(connection, {
    commitment: connection.commitment,
    filters: getFiltersByApplication(
      COLLECTION_ACCOUNT_NAME,
      applicationPublicKey
    ),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createCollectionDocument(pubkey, account)
      )
    )
  );
};
