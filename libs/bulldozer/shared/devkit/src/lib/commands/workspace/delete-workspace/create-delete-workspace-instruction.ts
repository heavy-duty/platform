import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram, DeleteWorkspaceParams } from '../../../utils';

export const createDeleteWorkspaceInstruction = (
  authority: PublicKey,
  workspacePublicKey: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteWorkspace({
    accounts: {
      workspace: workspacePublicKey,
      authority: authority,
    },
  });
};

export const createDeleteWorkspaceInstruction2 = (
  params: DeleteWorkspaceParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteWorkspace({
    accounts: {
      workspace: new PublicKey(params.workspaceId),
      authority: new PublicKey(params.authority),
    },
  });
};
