import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { bulldozerProgram } from '../../programs';
import { UpdateCollaboratorParams } from './types';

export const updateCollaborator = (
  params: UpdateCollaboratorParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      bulldozerProgram.methods
        .updateCollaborator({ status: params.status })
        .accounts({
          authority: new PublicKey(params.authority),
          user: new PublicKey(params.userId),
          workspace: new PublicKey(params.workspaceId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
