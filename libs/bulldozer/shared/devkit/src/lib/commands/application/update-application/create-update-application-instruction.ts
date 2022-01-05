import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const createUpdateApplicationInstruction = (
  authority: PublicKey,
  applicationPublicKey: PublicKey,
  applicationName: string
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateApplication(applicationName, {
    accounts: {
      application: applicationPublicKey,
      authority: authority,
    },
  });
};
