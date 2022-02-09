import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { DeleteCollectionParams } from './types';

export const deleteCollection = (
  params: DeleteCollectionParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteCollection({
    accounts: {
      application: new PublicKey(params.applicationId),
      collection: new PublicKey(params.collectionId),
      authority: new PublicKey(params.authority),
    },
  });
};
