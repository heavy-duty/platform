import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { SetInstructionAccountCollectionParams } from './types';

export const setInstructionAccountCollection = (
  endpoint: string,
  params: SetInstructionAccountCollectionParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.setInstructionAccountCollection()
        .accounts({
          authority: new PublicKey(params.authority),
          workspace: new PublicKey(params.workspaceId),
          application: new PublicKey(params.applicationId),
          collection: new PublicKey(params.collectionId),
          instruction: new PublicKey(params.instructionId),
          account: new PublicKey(params.instructionAccountId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
