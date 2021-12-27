import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export const getDeleteCollectionInstruction = (
  authority: PublicKey,
  program: Program,
  collectionPublicKey: PublicKey
): TransactionInstruction => {
  return program.instruction.deleteCollection({
    accounts: {
      collection: collectionPublicKey,
      authority: authority,
    },
  });
};
