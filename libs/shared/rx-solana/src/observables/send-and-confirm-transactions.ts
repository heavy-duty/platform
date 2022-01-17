import {
  Connection,
  sendAndConfirmRawTransaction,
  Transaction,
} from '@solana/web3.js';
import { defer, from } from 'rxjs';
import { concatMap, toArray } from 'rxjs/operators';

export const sendAndConfirmTransactions = (
  connection: Connection,
  transactions: Transaction[]
) => {
  return from(transactions).pipe(
    concatMap((transaction) =>
      from(
        defer(() =>
          sendAndConfirmRawTransaction(connection, transaction.serialize())
        )
      )
    ),
    toArray()
  );
};
