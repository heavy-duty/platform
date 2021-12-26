import { Program } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createApplicationInstruction } from '../instructions';

export const createApplication = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  workspaceId: PublicKey,
  applicationName: string
): Observable<{ transaction: Transaction; signers: Keypair[] }> => {
  return from(
    defer(() => connection.getRecentBlockhash(connection.commitment))
  ).pipe(
    map(({ blockhash }) => {
      const application = Keypair.generate();
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: authority,
      }).add(
        createApplicationInstruction(
          authority,
          program,
          workspaceId,
          application.publicKey,
          applicationName
        )
      );
      transaction.partialSign(application);

      return { transaction, signers: [application] };
    })
  );
};
