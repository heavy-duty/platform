import { Program } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createTransaction } from '../../operations';
import { createCollectionInstruction } from './create-collection.instruction';

export const createCollection = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  collectionName: string
): Observable<{ transaction: Transaction; signers: Keypair[] }> => {
  return createTransaction(connection, authority).pipe(
    map((transaction) => {
      const collection = Keypair.generate();
      transaction.add(
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
