import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export const getDeleteInstructionInstruction = (
  authority: PublicKey,
  program: Program,
  instructionPublicKey: PublicKey
): TransactionInstruction => {
  return program.instruction.deleteInstruction({
    accounts: {
      instruction: instructionPublicKey,
      authority: authority,
    },
  });
};
