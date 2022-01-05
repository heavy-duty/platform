import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createDeleteCollectionInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const createDeleteCollectionTransaction = (
  connection: Connection,
  authority: PublicKey,
  applicationPublicKey: PublicKey,
  collectionPublicKey: PublicKey
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createDeleteCollectionInstruction(
        authority,
        applicationPublicKey,
        collectionPublicKey
      )
    )
  );
};
