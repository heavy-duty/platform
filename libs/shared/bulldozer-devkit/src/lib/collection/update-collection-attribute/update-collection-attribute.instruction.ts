import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { CollectionAttributeDto } from '../../utils';

export const updateCollectionAttributeInstruction = (
  authority: PublicKey,
  program: Program,
  collectionAttributePublicKey: PublicKey,
  collectionAttributeDto: CollectionAttributeDto
): TransactionInstruction => {
  return program.instruction.updateCollectionAttribute(collectionAttributeDto, {
    accounts: {
      attribute: collectionAttributePublicKey,
      authority: authority,
    },
  });
};
