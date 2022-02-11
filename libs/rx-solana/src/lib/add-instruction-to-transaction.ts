import { Transaction, TransactionInstruction } from '@solana/web3.js';
import { concatMap, isObservable, map, Observable, of } from 'rxjs';

export const addInstructionToTransaction =
  (instruction: TransactionInstruction | Observable<TransactionInstruction>) =>
  (source: Observable<Transaction>): Observable<Transaction> =>
    source.pipe(
      concatMap((transaction) =>
        (isObservable(instruction) ? instruction : of(instruction)).pipe(
          map((instruction) => transaction.add(instruction))
        )
      )
    );
