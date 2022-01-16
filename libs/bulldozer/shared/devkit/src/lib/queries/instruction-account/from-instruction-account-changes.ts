import { PublicKey } from '@solana/web3.js';
import { fromDocumentChanges } from '../../operations';
import { ReactiveConnection } from '../../reactive-connection';
import { createInstructionAccountDocument } from './utils';

export const fromInstructionAccountChanges = (
  connection: ReactiveConnection,
  publicKey: PublicKey
) =>
  fromDocumentChanges(connection, publicKey, createInstructionAccountDocument);
