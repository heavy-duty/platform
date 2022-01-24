import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getUpdateInstructionArgumentInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';
import { InstructionArgumentDto } from '../../../utils';

export const getUpdateInstructionArgumentTransaction = (
  connection: Connection,
  authority: PublicKey,
  instructionArgumentPublicKey: PublicKey,
  instructionArgumentDto: InstructionArgumentDto
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      getUpdateInstructionArgumentInstruction(
        authority,
        instructionArgumentPublicKey,
        instructionArgumentDto
      )
    )
  );
};
