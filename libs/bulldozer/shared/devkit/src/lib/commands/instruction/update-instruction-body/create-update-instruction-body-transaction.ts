import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createUpdateInstructionBodyInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const createUpdateInstructionBodyTransaction = (
  connection: Connection,
  authority: PublicKey,
  instructionPublicKey: PublicKey,
  instructionBody: string
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createUpdateInstructionBodyInstruction(
        authority,
        instructionPublicKey,
        instructionBody
      )
    )
  );
};
