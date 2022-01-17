import { Commitment, Connection } from '@solana/web3.js';
import { defer, from } from 'rxjs';

export const getRecentBlockhash = (
  connection: Connection,
  commitment?: Commitment
) => {
  return from(
    defer(() =>
      connection.getRecentBlockhash(commitment || connection.commitment)
    )
  );
};
