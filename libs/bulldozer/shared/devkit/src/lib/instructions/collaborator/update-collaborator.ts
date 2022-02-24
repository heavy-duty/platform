import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { UpdateCollaboratorParams } from './types';

export const updateCollaborator = (
  endpoint: string,
  params: UpdateCollaboratorParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.updateCollaborator({ status: params.status })
        .accounts({
          authority: new PublicKey(params.authority),
          user: new PublicKey(params.userId),
          workspace: new PublicKey(params.workspaceId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
