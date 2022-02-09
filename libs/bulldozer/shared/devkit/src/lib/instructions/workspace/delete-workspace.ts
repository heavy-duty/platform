import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { DeleteWorkspaceParams } from './types';

export const deleteWorkspace = (
  params: DeleteWorkspaceParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteWorkspace({
    accounts: {
      workspace: new PublicKey(params.workspaceId),
      authority: new PublicKey(params.authority),
    },
  });
};
