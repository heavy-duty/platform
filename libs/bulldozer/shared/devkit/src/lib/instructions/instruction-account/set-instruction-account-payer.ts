import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { SetInstructionAccountPayerParams } from './types';

export const setInstructionAccountPayer = (
  endpoint: string,
  params: SetInstructionAccountPayerParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.setInstructionAccountPayer()
        .accounts({
          authority: new PublicKey(params.authority),
          workspace: new PublicKey(params.workspaceId),
          instruction: new PublicKey(params.instructionId),
          payer: new PublicKey(params.payer),
          account: new PublicKey(params.instructionAccountId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
