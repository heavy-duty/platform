import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export const getUpdateWorkspaceInstruction = (
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  workspaceName: string
): TransactionInstruction => {
  return program.instruction.updateWorkspace(workspaceName, {
    accounts: {
      workspace: workspacePublicKey,
      authority: authority,
    },
  });
};
