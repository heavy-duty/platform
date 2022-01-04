import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const getDeleteCollectionAttributeInstruction = (
  authority: PublicKey,
  collectionAttributePublicKey: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteCollectionAttribute({
    accounts: {
      attribute: collectionAttributePublicKey,
      authority: authority,
    },
  });
};
