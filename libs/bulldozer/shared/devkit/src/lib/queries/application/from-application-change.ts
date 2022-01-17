import { ReactiveConnection } from '@heavy-duty/rx-solana';
import { PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import {
  Application,
  createApplicationDocument,
  Document,
  fromAccountChange,
} from '../../utils';

export const fromApplicationChange = (
  connection: ReactiveConnection,
  publicKey: PublicKey
): Observable<Document<Application> | null> =>
  fromAccountChange(connection, publicKey, createApplicationDocument);
