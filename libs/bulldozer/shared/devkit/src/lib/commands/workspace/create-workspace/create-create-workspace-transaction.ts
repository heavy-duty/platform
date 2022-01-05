import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createCreateWorkspaceInstruction } from '.';
import { createTransaction } from '../../../operations';
import {
  addInstructionToTransaction,
  partialSignTransaction,
} from '../../../operators';

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
