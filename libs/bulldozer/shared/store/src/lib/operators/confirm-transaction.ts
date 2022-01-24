import { Connection, TransactionSignature } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

export const confirmTransaction =
  (connection: Connection) =>
  (
    source: Observable<TransactionSignature>
  ): Observable<TransactionSignature> =>
    source.pipe(
      concatMap((signature) =>
        from(defer(() => connection.confirmTransaction(signature))).pipe(
          map(() => signature)
        )
      )
    );
