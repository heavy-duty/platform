import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getRecentBlockhash } from './get-recent-blockhash';

export const createTransaction = (
  connection: Connection,
  authority: PublicKey
): Observable<Transaction> => {
  return getRecentBlockhash(connection).pipe(
    map(
      ({ blockhash }) =>
        new Transaction({
          recentBlockhash: blockhash,
          feePayer: authority,
        })
    )
  );
};
