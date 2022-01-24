import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const getDeleteApplicationInstruction = (
  authority: PublicKey,
  applicationPublicKey: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteApplication({
    accounts: {
      application: applicationPublicKey,
      authority: authority,
    },
  });
};
