import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import { CollectionAttributeDto } from '../../../utils';

export const createCreateCollectionAttributeInstruction = (
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  collectionPublicKey: PublicKey,
  attributePublicKey: PublicKey,
  attribute: CollectionAttributeDto
): TransactionInstruction => {
  return bulldozerProgram.instruction.createCollectionAttribute(attribute, {
    accounts: {
      attribute: attributePublicKey,
      workspace: workspacePublicKey,
      collection: collectionPublicKey,
      application: applicationPublicKey,
      authority,
      systemProgram: SystemProgram.programId,
      clock: SYSVAR_CLOCK_PUBKEY,
    },
  });
};
