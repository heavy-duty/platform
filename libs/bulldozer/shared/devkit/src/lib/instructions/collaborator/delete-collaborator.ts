import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { bulldozerProgram } from '../../programs';
import { DeleteCollaboratorParams } from './types';

export const deleteCollaborator = (
  params: DeleteCollaboratorParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      bulldozerProgram.methods
        .deleteCollaborator()
        .accounts({
          authority: new PublicKey(params.authority),
          workspace: new PublicKey(params.workspaceId),
          collaborator: new PublicKey(params.collaboratorId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
