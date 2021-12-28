import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const getCreateWorkspaceInstruction = (
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  workspaceName: string
): TransactionInstruction => {
  return bulldozerProgram.instruction.createWorkspace(workspaceName, {
    accounts: {
      workspace: workspacePublicKey,
      authority: authority,
      systemProgram: SystemProgram.programId,
    },
  });
};
