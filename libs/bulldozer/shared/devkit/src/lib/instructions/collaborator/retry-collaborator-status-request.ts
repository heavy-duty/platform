import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { RetryCollaboratorStatusRequestParams } from './types';

export const retryCollaboratorStatusRequest = (
  endpoint: string,
  params: RetryCollaboratorStatusRequestParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.retryCollaboratorStatusRequest()
        .accounts({
          authority: new PublicKey(params.authority),
          workspace: new PublicKey(params.workspaceId),
          collaborator: new PublicKey(params.collaboratorId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
