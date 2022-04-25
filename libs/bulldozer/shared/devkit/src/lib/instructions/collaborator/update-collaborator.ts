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
        .methods.updateCollaborator(params.collaboratorDto)
        .accounts({
          authority: new PublicKey(params.authority),
          workspace: new PublicKey(params.workspaceId),
          collaborator: new PublicKey(params.collaboratorId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
