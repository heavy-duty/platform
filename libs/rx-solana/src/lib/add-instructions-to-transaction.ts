import { Transaction, TransactionInstruction } from '@solana/web3.js';
import { concatMap, isObservable, map, Observable, of } from 'rxjs';

export const addInstructionsToTransaction =
  (
    instructions:
      | TransactionInstruction[]
      | Observable<TransactionInstruction[]>
  ) =>
  (source: Observable<Transaction>): Observable<Transaction> =>
    source.pipe(
      concatMap((transaction) =>
        (isObservable(instructions) ? instructions : of(instructions)).pipe(
          map((instructions) => {
            instructions.forEach((instruction) => {
              transaction.add(instruction);
            });

            return transaction;
          })
        )
      )
    );
