import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const createDeleteCollectionAttributeInstruction = (
  authority: PublicKey,
  collectionPublicKey: PublicKey,
  collectionAttributePublicKey: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteCollectionAttribute({
    accounts: {
      collection: collectionPublicKey,
      attribute: collectionAttributePublicKey,
      authority: authority,
    },
  });
};
