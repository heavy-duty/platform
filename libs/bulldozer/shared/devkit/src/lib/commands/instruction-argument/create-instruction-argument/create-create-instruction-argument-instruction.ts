import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  bulldozerProgram,
  CreateInstructionArgumentParams,
  InstructionArgumentDto,
} from '../../../utils';

export const createCreateInstructionArgumentInstruction = (
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey,
  argumentPublicKey: PublicKey,
  argument: InstructionArgumentDto
): TransactionInstruction => {
  return bulldozerProgram.instruction.createInstructionArgument(argument, {
    accounts: {
      argument: argumentPublicKey,
      workspace: workspacePublicKey,
      instruction: instructionPublicKey,
      application: applicationPublicKey,
      authority,
      systemProgram: SystemProgram.programId,
      clock: SYSVAR_CLOCK_PUBKEY,
    },
  });
};

export const createCreateInstructionArgumentInstruction2 = (
  params: CreateInstructionArgumentParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.createInstructionArgument(
    params.instructionArgumentDto,
    {
      accounts: {
        argument: new PublicKey(params.instructionArgumentId),
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
