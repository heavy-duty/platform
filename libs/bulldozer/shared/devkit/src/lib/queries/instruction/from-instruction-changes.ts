import { PublicKey } from '@solana/web3.js';
import { fromDocumentChanges } from '../../operations';
import { ReactiveConnection } from '../../reactive-connection';
import { createInstructionDocument } from './utils';

export const fromInstructionChanges = (
  connection: ReactiveConnection,
  publicKey: PublicKey
) => fromDocumentChanges(connection, publicKey, createInstructionDocument);
