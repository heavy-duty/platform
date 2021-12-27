import { Transaction, TransactionInstruction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const addAllInstructionsToTransaction =
  (instructions: TransactionInstruction[]) =>
  (source: Observable<Transaction>): Observable<Transaction> =>
    source.pipe(
      map((transaction) => {
        instructions.forEach((instruction) => {
          transaction.add(instruction);
        });

        return transaction;
      })
    );
