import { Connection } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { encodeFilters, getProgramAccounts } from '../../operations';
import {
  CollectionAttribute,
  CollectionAttributeFilters,
  COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
  Document,
} from '../../utils';
import { createCollectionAttributeDocument } from './utils';

export const getCollectionAttributes = (
  connection: Connection,
  filters: CollectionAttributeFilters
): Observable<Document<CollectionAttribute>[]> => {
  return getProgramAccounts(connection, {
    commitment: connection.commitment,
    filters: encodeFilters(COLLECTION_ATTRIBUTE_ACCOUNT_NAME, filters),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createCollectionAttributeDocument(pubkey, account)
      )
    )
  );
};
