import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export const deleteInstructionAccountInstruction = (
  authority: PublicKey,
  program: Program,
  instructionAccountPublicKey: PublicKey
): TransactionInstruction => {
  return program.instruction.deleteInstructionAccount({
    accounts: {
      account: instructionAccountPublicKey,
      authority: authority,
    },
  });
};
