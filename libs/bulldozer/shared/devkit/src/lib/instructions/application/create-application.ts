import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { CreateApplicationParams } from './types';

export const createApplication = (
  params: CreateApplicationParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.createApplication(
    { name: params.applicationName },
    {
      accounts: {
        workspace: new PublicKey(params.workspaceId),
        application: new PublicKey(params.applicationId),
        authority: new PublicKey(params.authority),
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
