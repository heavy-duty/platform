import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { DeleteInstructionAccountParams } from './types';

export const deleteInstructionAccount = (
  endpoint: string,
  params: DeleteInstructionAccountParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.deleteInstructionAccount()
        .accounts({
          authority: new PublicKey(params.authority),
          workspace: new PublicKey(params.workspaceId),
          instruction: new PublicKey(params.instructionId),
          account: new PublicKey(params.instructionAccountId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
