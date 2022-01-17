import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../../utils';

export const createCreateWorkspaceInstruction = (
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  workspaceName: string
): TransactionInstruction => {
  return bulldozerProgram.instruction.createWorkspace(
    { name: workspaceName },
    {
      accounts: {
        workspace: workspacePublicKey,
        authority: authority,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
