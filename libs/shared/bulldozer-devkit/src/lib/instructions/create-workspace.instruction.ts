import { Program } from '@project-serum/anchor';
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';

export const createWorkspaceInstruction = (
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  workspaceName: string,
): TransactionInstruction => {
  return program.instruction.createWorkspace(workspaceName, {
    accounts: {
      workspace: workspacePublicKey,
      authority: authority,
      systemProgram: SystemProgram.programId,
    },
  });
};
