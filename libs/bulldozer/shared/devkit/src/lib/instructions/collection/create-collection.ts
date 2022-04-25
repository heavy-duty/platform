import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { CreateCollectionParams } from './types';

export const createCollection = (
  endpoint: string,
  params: CreateCollectionParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.createCollection(params.collectionDto)
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
