import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const createCreateCollectionInstruction = (
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  collectionPublicKey: PublicKey,
  collectionName: string
): TransactionInstruction => {
  return bulldozerProgram.instruction.createCollection(collectionName, {
    accounts: {
      workspace: workspacePublicKey,
      application: applicationPublicKey,
      collection: collectionPublicKey,
      authority,
      systemProgram: SystemProgram.programId,
    },
  });
};
