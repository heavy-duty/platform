import { Program } from '@project-serum/anchor';
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';

export const getCreateInstructionInstruction = (
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey,
  instructionName: string
): TransactionInstruction => {
  return program.instruction.createInstruction(instructionName, {
    accounts: {
      workspace: workspacePublicKey,
      application: applicationPublicKey,
      instruction: instructionPublicKey,
      authority: authority,
      systemProgram: SystemProgram.programId,
    },
  });
};
