import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { bulldozerProgram } from '../../programs';
import { DeleteInstructionRelationParams } from './types';

export const deleteInstructionRelation = (
  params: DeleteInstructionRelationParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      bulldozerProgram.methods
        .deleteInstructionRelation()
        .accounts({
          from: new PublicKey(params.fromAccountId),
          to: new PublicKey(params.toAccountId),
          authority: new PublicKey(params.authority),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
