import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { bulldozerProgram } from '../../programs';
import { CreateApplicationParams } from './types';

export const createApplication = (
  params: CreateApplicationParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      bulldozerProgram.methods
        .createApplication({ name: params.applicationName })
        .accounts({
          workspace: new PublicKey(params.workspaceId),
          application: new PublicKey(params.applicationId),
          authority: new PublicKey(params.authority),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
