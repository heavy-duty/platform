import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { bulldozerProgram } from '../../programs';
import { DeleteCollectionParams } from './types';

export const deleteCollection = (
  params: DeleteCollectionParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      bulldozerProgram.methods
        .deleteCollection()
        .accounts({
          authority: new PublicKey(params.authority),
          collection: new PublicKey(params.collectionId),
          application: new PublicKey(params.applicationId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
