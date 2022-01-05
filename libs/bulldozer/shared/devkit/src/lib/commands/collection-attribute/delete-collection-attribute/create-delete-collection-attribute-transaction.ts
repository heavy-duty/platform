import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createDeleteCollectionAttributeInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const createDeleteCollectionAttributeTransaction = (
  connection: Connection,
  authority: PublicKey,
  collectionPublicKey: PublicKey,
  collectionAttributePublicKey: PublicKey
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createDeleteCollectionAttributeInstruction(
        authority,
        collectionPublicKey,
        collectionAttributePublicKey
      )
    )
  );
};
