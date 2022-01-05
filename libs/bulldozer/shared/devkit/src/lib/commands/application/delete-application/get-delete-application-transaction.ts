import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getDeleteApplicationInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const getDeleteApplicationTransaction = (
  connection: Connection,
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      getDeleteApplicationInstruction(
        authority,
        workspacePublicKey,
        applicationPublicKey
      )
    )
  );
};
