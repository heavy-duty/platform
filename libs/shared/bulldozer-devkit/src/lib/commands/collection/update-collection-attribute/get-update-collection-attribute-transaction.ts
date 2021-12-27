import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getUpdateCollectionAttributeInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';
import { CollectionAttributeDto } from '../../../utils';

export const getUpdateCollectionAttributeTransaction = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  collectionAttributePublicKey: PublicKey,
  collectionAttributeDto: CollectionAttributeDto
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      getUpdateCollectionAttributeInstruction(
        authority,
        program,
        collectionAttributePublicKey,
        collectionAttributeDto
      )
    )
  );
};
