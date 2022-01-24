import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const getDeleteInstructionInstruction = (
  authority: PublicKey,
  instructionPublicKey: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteInstruction({
    accounts: {
      instruction: instructionPublicKey,
      authority: authority,
    },
  });
};
