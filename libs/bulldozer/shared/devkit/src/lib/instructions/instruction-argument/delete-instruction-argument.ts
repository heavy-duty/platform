import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { bulldozerProgram } from '../../programs';
import { DeleteInstructionArgumentParams } from './types';

export const deleteInstructionArgument = (
  params: DeleteInstructionArgumentParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      bulldozerProgram.methods
        .deleteInstructionArgument()
        .accounts({
          instruction: new PublicKey(params.instructionId),
          argument: new PublicKey(params.instructionArgumentId),
          authority: new PublicKey(params.authority),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
