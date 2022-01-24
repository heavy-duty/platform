import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const getUpdateInstructionBodyInstruction = (
  authority: PublicKey,
  instructionPublicKey: PublicKey,
  instructionBody: string
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateInstructionBody(instructionBody, {
    accounts: {
      instruction: instructionPublicKey,
      authority: authority,
    },
  });
};
