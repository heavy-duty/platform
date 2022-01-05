import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getDeleteWorkspaceInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const getDeleteWorkspaceTransaction = (
  connection: Connection,
  authority: PublicKey,
  workspacePublicKey: PublicKey
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      getDeleteWorkspaceInstruction(authority, workspacePublicKey)
    )
  );
};
