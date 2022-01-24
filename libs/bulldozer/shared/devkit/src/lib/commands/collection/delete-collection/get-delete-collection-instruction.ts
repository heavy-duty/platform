import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const getDeleteCollectionInstruction = (
  authority: PublicKey,
  collectionPublicKey: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteCollection({
    accounts: {
      collection: collectionPublicKey,
      authority: authority,
    },
  });
};
