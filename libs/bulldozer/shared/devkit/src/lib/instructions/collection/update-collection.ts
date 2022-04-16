import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { UpdateCollectionParams } from './types';

export const updateCollection = (
  endpoint: string,
  params: UpdateCollectionParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.updateCollection(params.collectionDto)
        .accounts({
          authority: new PublicKey(params.authority),
          workspace: new PublicKey(params.workspaceId),
          application: new PublicKey(params.applicationId),
          collection: new PublicKey(params.collectionId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
