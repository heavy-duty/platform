import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createDeleteWorkspaceInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const createDeleteWorkspaceTransaction = (
  connection: Connection,
  authority: PublicKey,
  workspacePublicKey: PublicKey
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createDeleteWorkspaceInstruction(authority, workspacePublicKey)
    )
  );
};
