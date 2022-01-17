import {
  addInstructionToTransaction,
  createTransaction,
} from '@heavy-duty/rx-solana';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createUpdateCollectionInstruction } from '.';

export const createUpdateCollectionTransaction = (
  connection: Connection,
  authority: PublicKey,
  collectionPublicKey: PublicKey,
  collectionName: string
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createUpdateCollectionInstruction(
        authority,
        collectionPublicKey,
        collectionName
      )
    )
  );
};
