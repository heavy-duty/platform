import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const getUpdateApplicationInstruction = (
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
