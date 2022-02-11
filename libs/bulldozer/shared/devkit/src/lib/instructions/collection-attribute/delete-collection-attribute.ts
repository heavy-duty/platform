import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { bulldozerProgram } from '../../programs';
import { DeleteCollectionAttributeParams } from './types';

export const deleteCollectionAttribute = (
  params: DeleteCollectionAttributeParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      bulldozerProgram.methods
        .deleteCollectionAttribute()
        .accounts({
          attribute: new PublicKey(params.collectionAttributeId),
          collection: new PublicKey(params.collectionId),
          authority: new PublicKey(params.authority),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
