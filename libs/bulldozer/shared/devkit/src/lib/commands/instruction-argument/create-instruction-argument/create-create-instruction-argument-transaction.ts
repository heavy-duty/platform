import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createCreateInstructionArgumentInstruction } from '.';
import { createTransaction } from '../../../operations';
import {
  addInstructionToTransaction,
  partialSignTransaction,
} from '../../../operators';
import { InstructionArgumentDto } from '../../../utils';

export const createCreateInstructionArgumentTransaction = (
  connection: Connection,
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey,
  instructionArgumentKeypair: Keypair,
  instructionArgumentDto: InstructionArgumentDto
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createCreateInstructionArgumentInstruction(
        authority,
        workspacePublicKey,
        applicationPublicKey,
        instructionPublicKey,
        instructionArgumentKeypair.publicKey,
        instructionArgumentDto
      )
    ),
    partialSignTransaction(instructionArgumentKeypair)
  );
};
