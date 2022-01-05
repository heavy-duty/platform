import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const getDeleteInstructionAccountInstruction = (
  authority: PublicKey,
  instructionPublicKey: PublicKey,
  instructionAccountPublicKey: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteInstructionAccount({
    accounts: {
      instruction: instructionPublicKey,
      account: instructionAccountPublicKey,
      authority: authority,
    },
  });
};
