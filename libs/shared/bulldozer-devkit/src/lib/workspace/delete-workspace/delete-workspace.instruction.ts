import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export const deleteWorkspaceInstruction = (
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey
): TransactionInstruction => {
  return program.instruction.deleteWorkspace({
    accounts: {
      workspace: workspacePublicKey,
      authority: authority,
    },
  });
};
