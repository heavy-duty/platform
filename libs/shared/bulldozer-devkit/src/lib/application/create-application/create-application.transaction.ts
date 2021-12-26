import { Program } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createTransaction } from '../../operations';
import { createApplicationInstruction } from './create-application.instruction';

export const createApplication = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  workspaceId: PublicKey,
  applicationName: string
): Observable<{ transaction: Transaction; signers: Keypair[] }> => {
  return createTransaction(connection, authority).pipe(
    map((transaction) => {
      const application = Keypair.generate();
      transaction.add(
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
