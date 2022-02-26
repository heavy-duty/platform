import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { CreateCollectionAttributeParams } from './types';

export const createCollectionAttribute = (
  endpoint: string,
  params: CreateCollectionAttributeParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.createCollectionAttribute(params.collectionAttributeDto)
        .accounts({
          authority: new PublicKey(params.authority),
          workspace: new PublicKey(params.workspaceId),
          application: new PublicKey(params.applicationId),
          collection: new PublicKey(params.collectionId),
          attribute: new PublicKey(params.collectionAttributeId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
