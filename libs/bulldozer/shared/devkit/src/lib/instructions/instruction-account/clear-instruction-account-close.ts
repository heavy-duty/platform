import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { ClearInstructionAccountCloseParams } from './types';

export const clearInstructionAccountClose = (
  endpoint: string,
  params: ClearInstructionAccountCloseParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.clearInstructionAccountClose()
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
