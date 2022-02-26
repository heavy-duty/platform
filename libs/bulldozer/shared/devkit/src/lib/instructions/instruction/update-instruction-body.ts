import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { UpdateInstructionBodyParams } from './types';

export const updateInstructionBody = (
  endpoint: string,
  params: UpdateInstructionBodyParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.updateInstructionBody({ body: params.instructionBody })
        .accounts({
          authority: new PublicKey(params.authority),
          instruction: new PublicKey(params.instructionId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
