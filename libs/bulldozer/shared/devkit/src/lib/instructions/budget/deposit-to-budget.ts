import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { DepositToBudgetParams } from './types';

export const depositToBudget = (
  endpoint: string,
  params: DepositToBudgetParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.depositToBudget(params.depositToBudgetDto)
        .accounts({
          workspace: new PublicKey(params.workspaceId),
          authority: new PublicKey(params.authority),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
