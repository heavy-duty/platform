import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { UpdateInstructionParams } from './types';

export const updateInstruction = (
  endpoint: string,
  params: UpdateInstructionParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.updateInstruction(params.instructionDto)
        .accounts({
          authority: new PublicKey(params.authority),
          workspace: new PublicKey(params.workspaceId),
          application: new PublicKey(params.applicationId),
          instruction: new PublicKey(params.instructionId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
