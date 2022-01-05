import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createUpdateInstructionAccountInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';
import { InstructionAccountDto } from '../../../utils';

export const createUpdateInstructionAccountTransaction = (
  connection: Connection,
  authority: PublicKey,
  instructionAccountPublicKey: PublicKey,
  instructionAccountDto: InstructionAccountDto
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createUpdateInstructionAccountInstruction(
        authority,
        instructionAccountPublicKey,
        instructionAccountDto
      )
    )
  );
};
