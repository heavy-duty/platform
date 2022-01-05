import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const createDeleteInstructionInstruction = (
  authority: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteInstruction({
    accounts: {
      instruction: instructionPublicKey,
      application: applicationPublicKey,
      authority: authority,
    },
  });
};
