import { ReactiveConnection } from '@heavy-duty/rx-solana';
import { PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import {
  CollectionAttribute,
  createCollectionAttributeDocument,
  Document,
  fromAccountChange,
} from '../../utils';

export const fromCollectionAttributeChange = (
  connection: ReactiveConnection,
  publicKey: PublicKey
): Observable<Document<CollectionAttribute> | null> =>
  fromAccountChange(connection, publicKey, createCollectionAttributeDocument);
