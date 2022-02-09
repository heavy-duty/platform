import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { DeleteCollectionAttributeParams } from './types';

export const deleteCollectionAttribute = (
  params: DeleteCollectionAttributeParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteCollectionAttribute({
    accounts: {
      attribute: new PublicKey(params.collectionAttributeId),
      collection: new PublicKey(params.collectionId),
      authority: new PublicKey(params.authority),
    },
  });
};
