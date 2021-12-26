import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export const deleteInstructionArgumentInstruction = (
  authority: PublicKey,
  program: Program,
  instructionArgumentPublicKey: PublicKey
): TransactionInstruction => {
  return program.instruction.deleteInstructionArgument({
    accounts: {
      attribute: instructionArgumentPublicKey,
      authority: authority,
    },
  });
};
