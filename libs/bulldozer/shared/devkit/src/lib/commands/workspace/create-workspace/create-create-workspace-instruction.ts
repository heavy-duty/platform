import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram, CreateWorkspaceParams } from '../../../utils';

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

export const createCreateWorkspaceInstruction2 = (
  params: CreateWorkspaceParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.createWorkspace(
    { name: params.workspaceName },
    {
      accounts: {
        workspace: new PublicKey(params.workspaceId),
        authority: new PublicKey(params.authority),
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
