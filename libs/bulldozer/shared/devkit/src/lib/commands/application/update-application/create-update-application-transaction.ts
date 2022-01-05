import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createUpdateApplicationInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const createUpdateApplicationTransaction = (
  connection: Connection,
  authority: PublicKey,
  applicationPublicKey: PublicKey,
  applicationName: string
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createUpdateApplicationInstruction(
        authority,
        applicationPublicKey,
        applicationName
      )
    )
  );
};
