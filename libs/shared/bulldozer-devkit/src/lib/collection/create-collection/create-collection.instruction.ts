import { Program } from '@project-serum/anchor';
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';

export const createCollectionInstruction = (
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  collectionPublicKey: PublicKey,
  collectionName: string
): TransactionInstruction => {
  return program.instruction.createCollection(collectionName, {
    accounts: {
      workspace: workspacePublicKey,
      application: applicationPublicKey,
      collection: collectionPublicKey,
      authority,
      systemProgram: SystemProgram.programId,
    },
  });
};
