import { Connection } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { encodeFilters, getProgramAccounts } from '../../operations';
import {
  Collection,
  CollectionFilters,
  COLLECTION_ACCOUNT_NAME,
  Document,
} from '../../utils';
import { createCollectionDocument } from './utils';

export const getCollections = (
  connection: Connection,
  filters: CollectionFilters
): Observable<Document<Collection>[]> => {
  return getProgramAccounts(connection, {
    commitment: connection.commitment,
    filters: encodeFilters(COLLECTION_ACCOUNT_NAME, filters),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createCollectionDocument(pubkey, account)
      )
    )
  );
};
