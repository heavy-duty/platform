import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export const getUpdateApplicationInstruction = (
  authority: PublicKey,
  program: Program,
  applicationPublicKey: PublicKey,
  applicationName: string
): TransactionInstruction => {
  return program.instruction.updateApplication(applicationName, {
    accounts: {
      application: applicationPublicKey,
      authority: authority,
    },
  });
};
