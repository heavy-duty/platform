import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { updateApplicationInstruction } from '../instructions';

export const updateApplication = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  applicationPublicKey: PublicKey,
  applicationName: string
): Observable<{ transaction: Transaction }> => {
  return from(
    defer(() => connection.getRecentBlockhash(connection.commitment))
  ).pipe(
    map(({ blockhash }) => {
      console.log('am I called?');
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: authority,
      }).add(
        updateApplicationInstruction(
          authority,
          program,
          applicationPublicKey,
          applicationName
        )
      );

      return { transaction };
    })
  );
};
