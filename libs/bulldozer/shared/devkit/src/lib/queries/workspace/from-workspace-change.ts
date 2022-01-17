import { ReactiveConnection } from '@heavy-duty/rx-solana';
import { PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import {
  createWorkspaceDocument,
  Document,
  fromAccountChange,
  Workspace,
} from '../../utils';

export const fromWorkspaceChange = (
  connection: ReactiveConnection,
  publicKey: PublicKey
): Observable<Document<Workspace> | null> =>
  fromAccountChange(connection, publicKey, createWorkspaceDocument);
