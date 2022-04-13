import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { CreateApplicationParams } from './types';

export const createApplication = (
  endpoint: string,
  params: CreateApplicationParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.createApplication(params.applicationDto)
        .accounts({
          workspace: new PublicKey(params.workspaceId),
          application: new PublicKey(params.applicationId),
          authority: new PublicKey(params.authority),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
