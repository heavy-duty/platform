import { PublicKey } from '@solana/web3.js';
import { fromDocumentChanges } from '../../operations';
import { ReactiveConnection } from '../../reactive-connection';
import { createApplicationDocument } from './utils';

export const fromApplicationChanges = (
  connection: ReactiveConnection,
  publicKey: PublicKey
) => fromDocumentChanges(connection, publicKey, createApplicationDocument);
