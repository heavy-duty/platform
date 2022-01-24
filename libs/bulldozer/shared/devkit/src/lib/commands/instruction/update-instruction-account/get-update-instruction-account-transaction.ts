import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getUpdateInstructionAccountInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';
import {
  InstructionAccountDto,
  InstructionAccountExtras,
} from '../../../utils';

export const getUpdateInstructionAccountTransaction = (
  connection: Connection,
  authority: PublicKey,
  instructionAccountPublicKey: PublicKey,
  instructionAccountDto: InstructionAccountDto,
  instructionAccountExtras: InstructionAccountExtras
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      getUpdateInstructionAccountInstruction(
        authority,
        instructionAccountPublicKey,
        instructionAccountDto,
        instructionAccountExtras
      )
    )
  );
};
