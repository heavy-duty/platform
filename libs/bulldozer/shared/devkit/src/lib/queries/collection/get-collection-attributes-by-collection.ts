import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getFiltersByCollection, getProgramAccounts } from '../../operations';
import {
  CollectionAttribute,
  COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
  Document,
} from '../../utils';
import { createCollectionAttributeDocument } from './utils';

export const getCollectionAttributesByCollection = (
  connection: Connection,
  collectionPublicKey: PublicKey
): Observable<Document<CollectionAttribute>[]> => {
  return getProgramAccounts(connection, {
    commitment: connection.commitment,
    filters: getFiltersByCollection(
      COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
      collectionPublicKey
    ),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createCollectionAttributeDocument(pubkey, account)
      )
    )
  );
};
