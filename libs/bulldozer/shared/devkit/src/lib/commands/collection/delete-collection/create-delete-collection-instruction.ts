import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../utils';

export const createDeleteCollectionInstruction = (
  authority: PublicKey,
  applicationPublicKey: PublicKey,
  collectionPublicKey: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteCollection({
    accounts: {
      application: applicationPublicKey,
      collection: collectionPublicKey,
      authority: authority,
    },
  });
};
