import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import { InstructionArgumentDto } from '../../../utils';

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
