import { Keypair, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const partialSignTransaction =
  (keypair: Keypair) =>
  (source: Observable<Transaction>): Observable<Transaction> =>
    source.pipe(
      map((transaction) => {
        transaction.partialSign(keypair);

        return transaction;
      })
    );
