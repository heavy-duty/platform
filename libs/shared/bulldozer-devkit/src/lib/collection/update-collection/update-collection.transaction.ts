import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createTransaction } from '../../operations';
import { updateCollectionInstruction } from './update-collection.instruction';

export const updateCollection = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  collectionPublicKey: PublicKey,
  collectionName: string
): Observable<{ transaction: Transaction }> => {
  return createTransaction(connection, authority).pipe(
    map((transaction) => {
      transaction.add(
        updateCollectionInstruction(
          authority,
          program,
          collectionPublicKey,
          collectionName
        )
      );

      return { transaction };
    })
  );
};
