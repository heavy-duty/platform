import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { UpdateWorkspaceParams } from './types';

export const updateWorkspace = (
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
