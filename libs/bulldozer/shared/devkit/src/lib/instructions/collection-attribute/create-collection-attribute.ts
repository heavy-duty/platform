import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { CreateCollectionAttributeParams } from './types';

export const createCollectionAttribute = (
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
