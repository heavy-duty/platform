import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { DeleteApplicationParams } from './types';

export const deleteApplication = (
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
