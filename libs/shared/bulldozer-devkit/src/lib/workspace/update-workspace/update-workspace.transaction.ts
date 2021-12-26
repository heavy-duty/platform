import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { updateWorkspaceInstruction } from './update-workspace.instruction';

export const updateWorkspace = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  workspaceName: string
): Observable<{ transaction: Transaction }> => {
  return from(
    defer(() => connection.getRecentBlockhash(connection.commitment))
  ).pipe(
    map(({ blockhash }) => {
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: authority,
      }).add(
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
