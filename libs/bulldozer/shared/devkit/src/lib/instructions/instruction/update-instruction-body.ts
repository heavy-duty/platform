import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { bulldozerProgram } from '../../programs';
import { UpdateInstructionBodyParams } from './types';

export const updateInstructionBody = (
  params: UpdateInstructionBodyParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      bulldozerProgram.methods
        .updateInstructionBody({ body: params.instructionBody })
        .accounts({
          authority: new PublicKey(params.authority),
          instruction: new PublicKey(params.instructionId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
