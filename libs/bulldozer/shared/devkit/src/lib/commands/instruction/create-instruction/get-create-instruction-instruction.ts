import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const getCreateInstructionInstruction = (
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey,
  instructionName: string
): TransactionInstruction => {
  return bulldozerProgram.instruction.createInstruction(instructionName, {
    accounts: {
      workspace: workspacePublicKey,
      application: applicationPublicKey,
      instruction: instructionPublicKey,
      authority: authority,
      systemProgram: SystemProgram.programId,
    },
  });
};
