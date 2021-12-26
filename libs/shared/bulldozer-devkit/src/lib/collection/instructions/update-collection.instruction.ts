import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export const updateCollectionInstruction = (
  authority: PublicKey,
  program: Program,
  collectionPublicKey: PublicKey,
  collectionName: string
): TransactionInstruction => {
  return program.instruction.updateCollection(collectionName, {
    accounts: {
      collection: collectionPublicKey,
      authority: authority,
    },
  });
};
