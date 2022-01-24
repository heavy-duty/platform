import { Transaction, TransactionInstruction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const addInstructionToTransaction =
  (instruction: TransactionInstruction) =>
  (source: Observable<Transaction>): Observable<Transaction> =>
    source.pipe(map((transaction) => transaction.add(instruction)));
