import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const createUpdateWorkspaceInstruction = (
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  workspaceName: string
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateWorkspace(
    { name: workspaceName },
    {
      accounts: {
        workspace: workspacePublicKey,
        authority: authority,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
