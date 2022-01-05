import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getDeleteCollectionAttributeInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const getDeleteCollectionAttributeTransaction = (
  connection: Connection,
  authority: PublicKey,
  collectionPublicKey: PublicKey,
  collectionAttributePublicKey: PublicKey
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      getDeleteCollectionAttributeInstruction(
        authority,
        collectionPublicKey,
        collectionAttributePublicKey
      )
    )
  );
};
