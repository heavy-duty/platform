import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { CreateWorkspaceParams } from './types';

export const createWorkspace = (
  endpoint: string,
  params: CreateWorkspaceParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.createWorkspace(params.workspaceDto)
        .accounts({
          workspace: new PublicKey(params.workspaceId),
          authority: new PublicKey(params.authority),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
