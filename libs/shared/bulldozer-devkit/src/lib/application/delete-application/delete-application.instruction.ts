import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export const deleteApplicationInstruction = (
  authority: PublicKey,
  program: Program,
  applicationPublicKey: PublicKey
): TransactionInstruction => {
  return program.instruction.deleteApplication({
    accounts: {
      application: applicationPublicKey,
      authority: authority,
    },
  });
};
