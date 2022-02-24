import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { bulldozerProgram } from '../../programs';
import { UpdateInstructionParams } from './types';

export const updateInstruction = (
  params: UpdateInstructionParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      bulldozerProgram.methods
        .updateInstruction({ name: params.instructionName })
        .accounts({
          authority: new PublicKey(params.authority),
          instruction: new PublicKey(params.instructionId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
