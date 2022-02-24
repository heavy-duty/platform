import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { bulldozerProgram } from '../../programs';
import { UpdateApplicationParams } from './types';

export const updateApplication = (
  params: UpdateApplicationParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      bulldozerProgram.methods
        .updateApplication({ name: params.applicationName })
        .accounts({
          authority: new PublicKey(params.authority),
          application: new PublicKey(params.applicationId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
