import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const getDeleteInstructionArgumentInstruction = (
  authority: PublicKey,
  instructionArgumentPublicKey: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteInstructionArgument({
    accounts: {
      argument: instructionArgumentPublicKey,
      authority: authority,
    },
  });
};
