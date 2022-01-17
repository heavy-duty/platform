import { getProgramAccounts } from '@heavy-duty/rx-solana';
import { Connection } from '@solana/web3.js';
import { map, Observable } from 'rxjs';
import {
  BULLDOZER_PROGRAM_ID,
  CollectionAttribute,
  CollectionAttributeFilters,
  COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
  createCollectionAttributeDocument,
  Document,
  encodeFilters,
} from '../../utils';

export const getCollectionAttributes = (
  connection: Connection,
  filters: CollectionAttributeFilters
): Observable<Document<CollectionAttribute>[]> => {
  return getProgramAccounts(connection, BULLDOZER_PROGRAM_ID, {
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
