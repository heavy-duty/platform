import { PublicKey } from '@solana/web3.js';
import { fromDocumentChanges } from '../../operations';
import { ReactiveConnection } from '../../reactive-connection';
import { createInstructionArgumentDocument } from './utils';

export const fromInstructionArgumentChanges = (
  connection: ReactiveConnection,
  publicKey: PublicKey
) =>
  fromDocumentChanges(connection, publicKey, createInstructionArgumentDocument);
