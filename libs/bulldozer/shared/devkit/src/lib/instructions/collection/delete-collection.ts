import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { DeleteCollectionParams } from './types';

export const deleteCollection = (
  endpoint: string,
  params: DeleteCollectionParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.deleteCollection()
        .accounts({
          authority: new PublicKey(params.authority),
          collection: new PublicKey(params.collectionId),
          application: new PublicKey(params.applicationId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
