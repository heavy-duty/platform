import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const createTransaction = (
  connection: Connection,
  authority: PublicKey
): Observable<Transaction> => {
  return from(
    defer(() => connection.getRecentBlockhash(connection.commitment))
  ).pipe(
    map(
      ({ blockhash }) =>
        new Transaction({
          recentBlockhash: blockhash,
          feePayer: authority,
        })
    )
  );
};
