import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const getUpdateInstructionInstruction = (
  authority: PublicKey,
  instructionPublicKey: PublicKey,
  instructionName: string
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateInstruction(instructionName, {
    accounts: {
      instruction: instructionPublicKey,
      authority: authority,
    },
  });
};
