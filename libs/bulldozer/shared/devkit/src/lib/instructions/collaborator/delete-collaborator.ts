import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { DeleteCollaboratorParams } from './types';

export const deleteCollaborator = (
  endpoint: string,
  params: DeleteCollaboratorParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.deleteCollaborator()
        .accounts({
          authority: new PublicKey(params.authority),
          workspace: new PublicKey(params.workspaceId),
          collaborator: new PublicKey(params.collaboratorId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
