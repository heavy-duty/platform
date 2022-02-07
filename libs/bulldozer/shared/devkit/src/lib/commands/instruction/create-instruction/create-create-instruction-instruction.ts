import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram, CreateInstructionParams } from '../../../utils';

export const createCreateInstructionInstruction = (
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey,
  instructionName: string
): TransactionInstruction => {
  return bulldozerProgram.instruction.createInstruction(
    { name: instructionName },
    {
      accounts: {
        workspace: workspacePublicKey,
        application: applicationPublicKey,
        instruction: instructionPublicKey,
        authority: authority,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};

export const createCreateInstructionInstruction2 = (
  params: CreateInstructionParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.createInstruction(
    { name: params.instructionName },
    {
      accounts: {
        workspace: new PublicKey(params.workspaceId),
        instruction: new PublicKey(params.instructionId),
        application: new PublicKey(params.applicationId),
        authority: new PublicKey(params.authority),
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
