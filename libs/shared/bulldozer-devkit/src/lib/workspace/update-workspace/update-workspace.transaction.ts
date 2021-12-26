import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createTransaction } from '../../operations';
import { updateWorkspaceInstruction } from './update-workspace.instruction';

export const updateWorkspace = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  workspaceName: string
): Observable<{ transaction: Transaction }> => {
  return createTransaction(connection, authority).pipe(
    map((transaction) => {
      transaction.add(
        updateWorkspaceInstruction(
          authority,
          program,
          workspacePublicKey,
          workspaceName
        )
      );

      return { transaction };
    })
  );
};
