import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export const updateInstructionInstruction = (
  authority: PublicKey,
  program: Program,
  instructionPublicKey: PublicKey,
  instructionName: string
): TransactionInstruction => {
  return program.instruction.updateInstruction(instructionName, {
    accounts: {
      instruction: instructionPublicKey,
      authority: authority,
    },
  });
};
