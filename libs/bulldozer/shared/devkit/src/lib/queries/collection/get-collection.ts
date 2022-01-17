import { getAccountInfo } from '@heavy-duty/rx-solana';
import { Connection, PublicKey } from '@solana/web3.js';
import { map, Observable } from 'rxjs';
import { Collection, createCollectionDocument, Document } from '../../utils';

export const getCollection = (
  connection: Connection,
  collectionPublicKey: PublicKey
): Observable<Document<Collection> | null> => {
  return getAccountInfo(connection, collectionPublicKey).pipe(
    map(
      (account) =>
        account && createCollectionDocument(collectionPublicKey, account)
    )
  );
};
