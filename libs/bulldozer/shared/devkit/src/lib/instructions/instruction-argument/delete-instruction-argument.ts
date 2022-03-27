import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { DeleteInstructionArgumentParams } from './types';

export const deleteInstructionArgument = (
  endpoint: string,
  params: DeleteInstructionArgumentParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.deleteInstructionArgument()
        .accounts({
          authority: new PublicKey(params.authority),
          workspace: new PublicKey(params.workspaceId),
          instruction: new PublicKey(params.instructionId),
          argument: new PublicKey(params.instructionArgumentId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
