import { Program } from '@project-serum/anchor';
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { CollectionAttributeDto } from '../../../utils';

export const getCreateCollectionAttributeInstruction = (
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  collectionPublicKey: PublicKey,
  attributePublicKey: PublicKey,
  attribute: CollectionAttributeDto
): TransactionInstruction => {
  return program.instruction.createCollectionAttribute(attribute, {
    accounts: {
      attribute: attributePublicKey,
      workspace: workspacePublicKey,
      collection: collectionPublicKey,
      application: applicationPublicKey,
      authority,
      systemProgram: SystemProgram.programId,
    },
  });
};
