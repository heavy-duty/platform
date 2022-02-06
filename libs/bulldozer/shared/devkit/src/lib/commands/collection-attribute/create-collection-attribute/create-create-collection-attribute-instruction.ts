import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  bulldozerProgram,
  CollectionAttributeDto,
  CreateCollectionAttributeParams,
} from '../../../utils';

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

export const createCreateCollectionAttributeInstruction2 = (
  params: CreateCollectionAttributeParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.createCollectionAttribute(
    params.collectionAttributeDto,
    {
      accounts: {
        attribute: new PublicKey(params.collectionAttributeId),
        workspace: new PublicKey(params.workspaceId),
        collection: new PublicKey(params.collectionId),
        application: new PublicKey(params.applicationId),
        authority: new PublicKey(params.authority),
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
