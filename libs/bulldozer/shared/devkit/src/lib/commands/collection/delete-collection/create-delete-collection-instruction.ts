import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram, DeleteCollectionParams } from '../../../utils';

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

export const createDeleteCollectionInstruction2 = (
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
