import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../utils';

export const createDeleteInstructionArgumentInstruction = (
  authority: PublicKey,
  instructionPublicKey: PublicKey,
  instructionArgumentPublicKey: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteInstructionArgument({
    accounts: {
      instruction: instructionPublicKey,
      argument: instructionArgumentPublicKey,
      authority: authority,
    },
  });
};
