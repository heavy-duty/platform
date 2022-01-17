import {
  addInstructionToTransaction,
  createTransaction,
} from '@heavy-duty/rx-solana';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createUpdateInstructionInstruction } from '.';

export const createUpdateInstructionTransaction = (
  connection: Connection,
  authority: PublicKey,
  instructionPublicKey: PublicKey,
  instructionName: string
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createUpdateInstructionInstruction(
        authority,
        instructionPublicKey,
        instructionName
      )
    )
  );
};
