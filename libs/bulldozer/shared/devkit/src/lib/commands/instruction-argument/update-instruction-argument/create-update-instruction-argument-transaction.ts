import {
  addInstructionToTransaction,
  createTransaction,
} from '@heavy-duty/rx-solana';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createUpdateInstructionArgumentInstruction } from '.';
import { InstructionArgumentDto } from '../../../utils';

export const createUpdateInstructionArgumentTransaction = (
  connection: Connection,
  authority: PublicKey,
  instructionArgumentPublicKey: PublicKey,
  instructionArgumentDto: InstructionArgumentDto
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createUpdateInstructionArgumentInstruction(
        authority,
        instructionArgumentPublicKey,
        instructionArgumentDto
      )
    )
  );
};
