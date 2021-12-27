import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export const getUpdateInstructionBodyInstruction = (
  authority: PublicKey,
  program: Program,
  instructionPublicKey: PublicKey,
  instructionBody: string
): TransactionInstruction => {
  return program.instruction.updateInstructionBody(instructionBody, {
    accounts: {
      instruction: instructionPublicKey,
      authority: authority,
    },
  });
};
