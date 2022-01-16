import { PublicKey } from '@solana/web3.js';
import { fromDocumentChanges } from '../../operations';
import { ReactiveConnection } from '../../reactive-connection';
import { createInstructionRelationDocument } from './utils';

export const fromInstructionRelationChanges = (
  connection: ReactiveConnection,
  publicKey: PublicKey
) =>
  fromDocumentChanges(connection, publicKey, createInstructionRelationDocument);
