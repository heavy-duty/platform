import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { CreateCollectionParams } from './types';

export const createCollection = (
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
