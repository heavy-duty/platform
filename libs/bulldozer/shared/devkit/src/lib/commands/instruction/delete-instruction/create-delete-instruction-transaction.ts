import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createDeleteInstructionInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const createDeleteInstructionTransaction = (
  connection: Connection,
  authority: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createDeleteInstructionInstruction(
        authority,
        applicationPublicKey,
        instructionPublicKey
      )
    )
  );
};
