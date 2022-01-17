import { getProgramAccounts } from '@heavy-duty/rx-solana';
import { Connection } from '@solana/web3.js';
import { map, Observable } from 'rxjs';
import {
  BULLDOZER_PROGRAM_ID,
  Collection,
  CollectionFilters,
  COLLECTION_ACCOUNT_NAME,
  createCollectionDocument,
  Document,
  encodeFilters,
} from '../../utils';

export const getCollections = (
  connection: Connection,
  filters: CollectionFilters
): Observable<Document<Collection>[]> => {
  return getProgramAccounts(connection, BULLDOZER_PROGRAM_ID, {
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
