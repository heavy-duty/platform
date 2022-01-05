import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createDeleteInstructionRelationInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const createDeleteInstructionRelationTransaction = (
  connection: Connection,
  authority: PublicKey,
  fromPublicKey: PublicKey,
  toPublicKey: PublicKey,
  instructionRelation: PublicKey
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createDeleteInstructionRelationInstruction(
        authority,
        fromPublicKey,
        toPublicKey,
        instructionRelation
      )
    )
  );
};
