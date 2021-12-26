import { Program } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createCollectionInstruction } from './create-collection.instruction';

export const createCollection = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  collectionName: string
): Observable<{ transaction: Transaction; signers: Keypair[] }> => {
  return from(
    defer(() => connection.getRecentBlockhash(connection.commitment))
  ).pipe(
    map(({ blockhash }) => {
      const collection = Keypair.generate();
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: authority,
      }).add(
        createCollectionInstruction(
          authority,
          program,
          workspacePublicKey,
          applicationPublicKey,
          collection.publicKey,
          collectionName
        )
      );
      transaction.partialSign(collection);

      return { transaction, signers: [collection] };
    })
  );
};
