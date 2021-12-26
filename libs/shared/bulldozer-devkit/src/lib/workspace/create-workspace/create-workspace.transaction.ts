import { Program } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createWorkspaceInstruction } from './create-workspace.instruction';

export const createWorkspace = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  workspaceName: string
): Observable<{ transaction: Transaction; signers: Keypair[] }> => {
  return from(
    defer(() => connection.getRecentBlockhash(connection.commitment))
  ).pipe(
    map(({ blockhash }) => {
      const workspace = Keypair.generate();
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: authority,
      }).add(
        createWorkspaceInstruction(
          authority,
          program,
          workspace.publicKey,
          workspaceName
        )
      );
      transaction.partialSign(workspace);

      return { transaction, signers: [workspace] };
    })
  );
};
