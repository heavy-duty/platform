import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { CreateCollaboratorParams } from './types';

export const createCollaborator = (
  endpoint: string,
  params: CreateCollaboratorParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.createCollaborator()
        .accounts({
          authority: new PublicKey(params.authority),
          user: new PublicKey(params.userId),
          workspace: new PublicKey(params.workspaceId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
