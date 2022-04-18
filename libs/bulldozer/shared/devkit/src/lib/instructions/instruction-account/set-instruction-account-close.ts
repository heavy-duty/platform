import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { SetInstructionAccountCloseParams } from './types';

export const setInstructionAccountClose = (
  endpoint: string,
  params: SetInstructionAccountCloseParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.setInstructionAccountClose()
        .accounts({
          authority: new PublicKey(params.authority),
          workspace: new PublicKey(params.workspaceId),
          instruction: new PublicKey(params.instructionId),
          close: new PublicKey(params.close),
          account: new PublicKey(params.instructionAccountId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
