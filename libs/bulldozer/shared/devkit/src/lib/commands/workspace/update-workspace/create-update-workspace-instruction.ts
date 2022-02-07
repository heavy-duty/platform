import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram, UpdateWorkspaceParams } from '../../../utils';

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

export const createUpdateWorkspaceInstruction2 = (
  params: UpdateWorkspaceParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateWorkspace(
    { name: params.workspaceName },
    {
      accounts: {
        workspace: new PublicKey(params.workspaceId),
        authority: new PublicKey(params.authority),
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
