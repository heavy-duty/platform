import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import {
  bulldozerProgram,
  DeleteCollectionAttributeParams,
} from '../../../utils';

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

export const createDeleteCollectionAttributeInstruction2 = (
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
