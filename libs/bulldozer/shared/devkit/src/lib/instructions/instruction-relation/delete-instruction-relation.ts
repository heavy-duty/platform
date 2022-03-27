import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { DeleteInstructionRelationParams } from './types';

export const deleteInstructionRelation = (
  endpoint: string,
  params: DeleteInstructionRelationParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.deleteInstructionRelation()
        .accounts({
          authority: new PublicKey(params.authority),
          workspace: new PublicKey(params.workspaceId),
          instruction: new PublicKey(params.instructionId),
          from: new PublicKey(params.fromAccountId),
          to: new PublicKey(params.toAccountId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
