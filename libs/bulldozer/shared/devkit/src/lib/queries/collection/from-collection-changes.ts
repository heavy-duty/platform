import { PublicKey } from '@solana/web3.js';
import { fromDocumentChanges } from '../../operations';
import { ReactiveConnection } from '../../reactive-connection';
import { createCollectionDocument } from './utils';

export const fromCollectionChanges = (
  connection: ReactiveConnection,
  publicKey: PublicKey
) => fromDocumentChanges(connection, publicKey, createCollectionDocument);
