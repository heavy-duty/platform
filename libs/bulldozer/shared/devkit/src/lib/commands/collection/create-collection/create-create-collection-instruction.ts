import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram, CreateCollectionParams } from '../../../utils';

export const createCreateCollectionInstruction = (
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  collectionPublicKey: PublicKey,
  collectionName: string
): TransactionInstruction => {
  return bulldozerProgram.instruction.createCollection(
    { name: collectionName },
    {
      accounts: {
        workspace: workspacePublicKey,
        application: applicationPublicKey,
        collection: collectionPublicKey,
        authority,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};

export const createCreateCollectionInstruction2 = (
  params: CreateCollectionParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.createCollection(
    { name: params.collectionName },
    {
      accounts: {
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
