import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const createUpdateWorkspaceInstruction = (
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  workspaceName: string
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateWorkspace(workspaceName, {
    accounts: {
      workspace: workspacePublicKey,
      authority: authority,
    },
  });
};
