import {
  addInstructionToTransaction,
  createTransaction,
  partialSignTransaction,
} from '@heavy-duty/rx-solana';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createCreateWorkspaceInstruction } from '.';

export const createCreateWorkspaceTransaction = (
  connection: Connection,
  authority: PublicKey,
  workspaceKeypair: Keypair,
  workspaceName: string
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createCreateWorkspaceInstruction(
        authority,
        workspaceKeypair.publicKey,
        workspaceName
      )
    ),
    partialSignTransaction(workspaceKeypair)
  );
};
