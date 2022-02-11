import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { bulldozerProgram } from '../../programs';
import { UpdateCollectionAttributeParams } from './types';

export const updateCollectionAttribute = (
  params: UpdateCollectionAttributeParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      bulldozerProgram.methods
        .updateCollectionAttribute(params.collectionAttributeDto)
        .accounts({
          attribute: new PublicKey(params.collectionAttributeId),
          authority: new PublicKey(params.authority),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
