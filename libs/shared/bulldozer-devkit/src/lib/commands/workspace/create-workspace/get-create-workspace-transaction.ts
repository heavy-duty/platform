import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getCreateWorkspaceInstruction } from '.';
import { createTransaction } from '../../../operations';
import {
  addInstructionToTransaction,
  partialSignTransaction,
} from '../../../operators';

export const getCreateWorkspaceTransaction = (
  connection: Connection,
  authority: PublicKey,
  workspaceKeypair: Keypair,
  workspaceName: string
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      getCreateWorkspaceInstruction(
        authority,
        workspaceKeypair.publicKey,
        workspaceName
      )
    ),
    partialSignTransaction(workspaceKeypair)
  );
};
