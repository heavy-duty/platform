import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export const updateInstructionArgumentInstruction = (
  authority: PublicKey,
  program: Program,
  instructionArgumentPublicKey: PublicKey,
  instructionArgumentName: string
): TransactionInstruction => {
  return program.instruction.updateInstructionArgument(
    instructionArgumentName,
    {
      accounts: {
        attribute: instructionArgumentPublicKey,
        authority: authority,
      },
    }
  );
};
