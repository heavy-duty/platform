import { Signer, Transaction } from '@solana/web3.js';
import { map, Observable } from 'rxjs';

export const partiallySignTransaction =
  (signer: Signer) =>
  (source: Observable<Transaction>): Observable<Transaction> =>
    source.pipe(
      map((transaction) => {
        transaction.partialSign(signer);
        return transaction;
      })
    );
