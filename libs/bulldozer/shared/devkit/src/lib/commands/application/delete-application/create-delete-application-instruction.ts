import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram, DeleteApplicationParams } from '../../../utils';

export const createDeleteApplicationInstruction = (
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

export const createDeleteApplicationInstruction2 = (
  params: DeleteApplicationParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteApplication({
    accounts: {
      workspace: new PublicKey(params.workspaceId),
      application: new PublicKey(params.applicationId),
      authority: new PublicKey(params.authority),
    },
  });
};
