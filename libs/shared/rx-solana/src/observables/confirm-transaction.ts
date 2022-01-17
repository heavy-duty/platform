import { Connection, TransactionSignature } from '@solana/web3.js';
import { defer, from } from 'rxjs';
import { map } from 'rxjs/operators';

export const confirmTransaction = (
  connection: Connection,
  signature: TransactionSignature
) =>
  from(defer(() => connection.confirmTransaction(signature))).pipe(
    map(() => signature)
  );
