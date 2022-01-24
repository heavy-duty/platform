import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getAccountInfo } from '../../operations';
import { Collection, Document } from '../../utils';
import { createCollectionDocument } from './utils';

export const getCollection = (
  connection: Connection,
  collectionPublicKey: PublicKey
): Observable<Document<Collection> | null> => {
  return getAccountInfo(connection, collectionPublicKey).pipe(
    map(
      (account) =>
        account && createCollectionDocument(collectionPublicKey, account.data)
    )
  );
};
