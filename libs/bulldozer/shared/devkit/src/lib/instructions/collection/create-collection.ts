import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { bulldozerProgram } from '../../programs';
import { CreateCollectionParams } from './types';

export const createCollection = (
  params: CreateCollectionParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      bulldozerProgram.methods
        .createCollection({ name: params.collectionName })
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
