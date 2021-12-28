import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const getUpdateCollectionInstruction = (
  authority: PublicKey,
  collectionPublicKey: PublicKey,
  collectionName: string
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateCollection(collectionName, {
    accounts: {
      collection: collectionPublicKey,
      authority: authority,
    },
  });
};
