import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { bulldozerProgram } from '../../programs';
import { DeleteInstructionParams } from './types';

export const deleteInstruction = (
  params: DeleteInstructionParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      bulldozerProgram.methods
        .deleteInstruction()
        .accounts({
          authority: new PublicKey(params.authority),
          application: new PublicKey(params.applicationId),
          instruction: new PublicKey(params.instructionId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
