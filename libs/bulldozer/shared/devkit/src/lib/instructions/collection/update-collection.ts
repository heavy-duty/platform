import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { bulldozerProgram } from '../../programs';
import { UpdateCollectionParams } from './types';

export const updateCollection = (
  params: UpdateCollectionParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      bulldozerProgram.methods
        .updateCollection({ name: params.collectionName })
        .accounts({
          authority: new PublicKey(params.authority),
          collection: new PublicKey(params.collectionId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
