import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { CreateWorkspaceParams } from './types';

export const createWorkspace = (
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
