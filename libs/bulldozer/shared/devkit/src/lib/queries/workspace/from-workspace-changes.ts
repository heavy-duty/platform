import { PublicKey } from '@solana/web3.js';
import { fromDocumentChanges } from '../../operations';
import { ReactiveConnection } from '../../reactive-connection';
import { createWorkspaceDocument } from './utils';

export const fromWorkspaceChanges = (
  connection: ReactiveConnection,
  publicKey: PublicKey
) => fromDocumentChanges(connection, publicKey, createWorkspaceDocument);
