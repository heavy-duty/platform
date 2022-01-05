import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createUpdateInstructionInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

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
