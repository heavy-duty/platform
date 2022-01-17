import {
  addInstructionToTransaction,
  createTransaction,
} from '@heavy-duty/rx-solana';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createDeleteWorkspaceInstruction } from '.';

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
