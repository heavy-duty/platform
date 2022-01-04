import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import { CollectionAttributeDto } from '../../../utils';

export const getUpdateCollectionAttributeInstruction = (
  authority: PublicKey,
  collectionAttributePublicKey: PublicKey,
  collectionAttributeDto: CollectionAttributeDto
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateCollectionAttribute(
    collectionAttributeDto,
    {
      accounts: {
        attribute: collectionAttributePublicKey,
        authority: authority,
      },
    }
  );
};
