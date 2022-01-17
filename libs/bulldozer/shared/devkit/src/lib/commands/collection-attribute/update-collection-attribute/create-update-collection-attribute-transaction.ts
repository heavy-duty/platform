import {
  addInstructionToTransaction,
  createTransaction,
} from '@heavy-duty/rx-solana';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createUpdateCollectionAttributeInstruction } from '.';
import { CollectionAttributeDto } from '../../../utils';

export const createUpdateCollectionAttributeTransaction = (
  connection: Connection,
  authority: PublicKey,
  collectionAttributePublicKey: PublicKey,
  collectionAttributeDto: CollectionAttributeDto
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createUpdateCollectionAttributeInstruction(
        authority,
        collectionAttributePublicKey,
        collectionAttributeDto
      )
    )
  );
};
