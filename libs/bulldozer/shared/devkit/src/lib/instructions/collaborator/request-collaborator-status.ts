import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { RequestCollaboratorStatusParams } from './types';

export const requestCollaboratorStatus = (
  endpoint: string,
  params: RequestCollaboratorStatusParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.requestCollaboratorStatus()
        .accounts({
          authority: new PublicKey(params.authority),
          user: new PublicKey(params.userId),
          workspace: new PublicKey(params.workspaceId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
