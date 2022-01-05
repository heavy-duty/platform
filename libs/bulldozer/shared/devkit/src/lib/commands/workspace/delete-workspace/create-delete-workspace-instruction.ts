import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

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
