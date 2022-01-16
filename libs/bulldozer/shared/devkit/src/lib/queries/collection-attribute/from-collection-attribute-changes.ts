import { PublicKey } from '@solana/web3.js';
import { fromDocumentChanges } from '../../operations';
import { ReactiveConnection } from '../../reactive-connection';
import { createCollectionAttributeDocument } from './utils';

export const fromCollectionAttributeChanges = (
  connection: ReactiveConnection,
  publicKey: PublicKey
) =>
  fromDocumentChanges(connection, publicKey, createCollectionAttributeDocument);
