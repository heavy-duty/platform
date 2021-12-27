import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export const getDeleteInstructionArgumentInstruction = (
  authority: PublicKey,
  program: Program,
  instructionArgumentPublicKey: PublicKey
): TransactionInstruction => {
  return program.instruction.deleteInstructionArgument({
    accounts: {
      argument: instructionArgumentPublicKey,
      authority: authority,
    },
  });
};
