import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createDeleteApplicationInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const createDeleteApplicationTransaction = (
  connection: Connection,
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createDeleteApplicationInstruction(
        authority,
        workspacePublicKey,
        applicationPublicKey
      )
    )
  );
};
