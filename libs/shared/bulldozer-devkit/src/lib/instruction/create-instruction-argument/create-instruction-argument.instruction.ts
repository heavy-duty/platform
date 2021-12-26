import { Program } from '@project-serum/anchor';
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { InstructionArgumentDto } from '../../utils';

export const createInstructionArgumentInstruction = (
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey,
  argumentPublicKey: PublicKey,
  argument: InstructionArgumentDto
): TransactionInstruction => {
  return program.instruction.createInstructionArgument(argument, {
    accounts: {
      argument: argumentPublicKey,
      workspace: workspacePublicKey,
      instruction: instructionPublicKey,
      application: applicationPublicKey,
      authority,
      systemProgram: SystemProgram.programId,
    },
  });
};
