import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getDeleteInstructionInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const getDeleteInstructionTransaction = (
  connection: Connection,
  authority: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      getDeleteInstructionInstruction(
        authority,
        applicationPublicKey,
        instructionPublicKey
      )
    )
  );
};
