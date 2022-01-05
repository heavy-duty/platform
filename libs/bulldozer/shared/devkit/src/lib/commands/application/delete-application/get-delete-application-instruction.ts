import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const getDeleteApplicationInstruction = (
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteApplication({
    accounts: {
      workspace: workspacePublicKey,
      application: applicationPublicKey,
      authority: authority,
    },
  });
};
