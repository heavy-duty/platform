import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { UpdateWorkspaceParams } from './types';

export const updateWorkspace = (
  endpoint: string,
  params: UpdateWorkspaceParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.updateWorkspace(params.workspaceDto)
        .accounts({
          workspace: new PublicKey(params.workspaceId),
          authority: new PublicKey(params.authority),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
