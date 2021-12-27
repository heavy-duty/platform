import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getUpdateCollectionInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const getUpdateCollectionTransaction = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  collectionPublicKey: PublicKey,
  collectionName: string
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      getUpdateCollectionInstruction(
        authority,
        program,
        collectionPublicKey,
        collectionName
      )
    )
  );
};
