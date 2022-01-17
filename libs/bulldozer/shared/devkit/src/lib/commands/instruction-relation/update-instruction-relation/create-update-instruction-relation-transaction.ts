import {
  addInstructionToTransaction,
  createTransaction,
} from '@heavy-duty/rx-solana';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createUpdateInstructionRelationInstruction } from '.';

export const createUpdateInstructionRelationTransaction = (
  connection: Connection,
  authority: PublicKey,
  instructionRelationPublicKey: PublicKey,
  fromPublicKey: PublicKey,
  toPublicKey: PublicKey
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createUpdateInstructionRelationInstruction(
        authority,
        instructionRelationPublicKey,
        fromPublicKey,
        toPublicKey
      )
    )
  );
};
