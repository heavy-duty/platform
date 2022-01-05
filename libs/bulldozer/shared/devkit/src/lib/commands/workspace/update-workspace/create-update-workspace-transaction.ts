import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createUpdateWorkspaceInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const createUpdateWorkspaceTransaction = (
  connection: Connection,
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  workspaceName: string
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createUpdateWorkspaceInstruction(
        authority,
        workspacePublicKey,
        workspaceName
      )
    )
  );
};
