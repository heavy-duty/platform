import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { bulldozerProgram } from '../../programs';
import { UpdateWorkspaceParams } from './types';

export const updateWorkspace = (
  params: UpdateWorkspaceParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      bulldozerProgram.methods
        .updateWorkspace({ name: params.workspaceName })
        .accounts({
          workspace: new PublicKey(params.workspaceId),
          authority: new PublicKey(params.authority),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
