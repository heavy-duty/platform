import { ReactiveConnection } from '@heavy-duty/rx-solana';
import { PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import {
  Collection,
  createCollectionDocument,
  Document,
  fromAccountChange,
} from '../../utils';

export const fromCollectionChange = (
  connection: ReactiveConnection,
  publicKey: PublicKey
): Observable<Document<Collection> | null> =>
  fromAccountChange(connection, publicKey, createCollectionDocument);
