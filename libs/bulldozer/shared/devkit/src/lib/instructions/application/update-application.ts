import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { UpdateApplicationParams } from './types';

export const updateApplication = (
  endpoint: string,
  params: UpdateApplicationParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.updateApplication(params.applicationDto)
        .accounts({
          authority: new PublicKey(params.authority),
          workspace: new PublicKey(params.workspaceId),
          application: new PublicKey(params.applicationId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
