import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getUpdateInstructionArgumentInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';
import { InstructionArgumentDto } from '../../../utils';

export const getUpdateInstructionArgumentTransaction = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  instructionArgumentPublicKey: PublicKey,
  instructionArgumentDto: InstructionArgumentDto
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      getUpdateInstructionArgumentInstruction(
        authority,
        program,
        instructionArgumentPublicKey,
        instructionArgumentDto
      )
    )
  );
};
