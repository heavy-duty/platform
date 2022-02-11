import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { bulldozerProgram } from '../../programs';
import { DeleteInstructionAccountParams } from './types';

export const deleteInstructionAccount = (
  params: DeleteInstructionAccountParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      bulldozerProgram.methods
        .deleteInstructionAccount()
        .accounts({
          instruction: new PublicKey(params.instructionId),
          account: new PublicKey(params.instructionAccountId),
          authority: new PublicKey(params.authority),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
