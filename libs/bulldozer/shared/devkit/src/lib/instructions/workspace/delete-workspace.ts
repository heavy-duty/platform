import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { DeleteWorkspaceParams } from './types';

export const deleteWorkspace = (
  endpoint: string,
  params: DeleteWorkspaceParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.deleteWorkspace()
        .accounts({
          workspace: new PublicKey(params.workspaceId),
          authority: new PublicKey(params.authority),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
