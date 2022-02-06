import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram, CreateApplicationParams } from '../../../utils';

export const createCreateApplicationInstruction = (
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  applicationName: string
): TransactionInstruction => {
  return bulldozerProgram.instruction.createApplication(
    { name: applicationName },
    {
      accounts: {
        workspace: workspacePublicKey,
        application: applicationPublicKey,
        authority: authority,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};

export const createCreateApplicationInstruction2 = (
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
