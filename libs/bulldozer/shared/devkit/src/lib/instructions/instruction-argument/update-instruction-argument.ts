import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { bulldozerProgram } from '../../programs';
import { UpdateInstructionArgumentParams } from './types';

export const updateInstructionArgument = (
  params: UpdateInstructionArgumentParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      bulldozerProgram.methods
        .updateInstructionArgument(params.instructionArgumentDto)
        .accounts({
          authority: new PublicKey(params.authority),
          argument: new PublicKey(params.instructionArgumentId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
