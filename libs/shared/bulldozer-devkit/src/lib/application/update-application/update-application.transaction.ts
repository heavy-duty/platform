import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createTransaction } from '../../operations';
import { updateApplicationInstruction } from './update-application.instruction';

export const updateApplication = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  applicationPublicKey: PublicKey,
  applicationName: string
): Observable<{ transaction: Transaction }> => {
  return createTransaction(connection, authority).pipe(
    map((transaction) => {
      transaction.add(
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
