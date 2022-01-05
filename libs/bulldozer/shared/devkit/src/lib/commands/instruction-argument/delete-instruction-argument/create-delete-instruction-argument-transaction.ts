import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createDeleteInstructionArgumentInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const createDeleteInstructionArgumentTransaction = (
  connection: Connection,
  authority: PublicKey,
  instructionPublicKey: PublicKey,
  instructionArgumentPublicKey: PublicKey
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createDeleteInstructionArgumentInstruction(
        authority,
        instructionPublicKey,
        instructionArgumentPublicKey
      )
    )
  );
};
