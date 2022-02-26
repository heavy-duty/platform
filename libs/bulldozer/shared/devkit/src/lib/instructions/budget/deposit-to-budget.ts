import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { Observable, of } from 'rxjs';
import { DepositToBudgetParams } from './types';

export const depositToBudget = (
  params: DepositToBudgetParams
): Observable<TransactionInstruction> => {
  return of(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(params.authority),
      toPubkey: new PublicKey(params.budgetId),
      lamports: params.lamports,
    })
  );
};
