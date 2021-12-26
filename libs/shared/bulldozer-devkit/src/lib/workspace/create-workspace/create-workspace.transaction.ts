import { Program } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createTransaction } from '../../operations';
import { createWorkspaceInstruction } from './create-workspace.instruction';

export const createWorkspace = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  workspaceName: string
): Observable<{ transaction: Transaction; signers: Keypair[] }> => {
  return createTransaction(connection, authority).pipe(
    map((transaction) => {
      const workspace = Keypair.generate();
      transaction.add(
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
