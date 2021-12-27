import { Program } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getCreateInstructionArgumentInstruction } from '.';
import { createTransaction } from '../../../operations';
import {
  addInstructionToTransaction,
  partialSignTransaction,
} from '../../../operators';
import { InstructionArgumentDto } from '../../../utils';

export const getCreateInstructionArgumentTransaction = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey,
  instructionArgumentKeypair: Keypair,
  instructionArgumentDto: InstructionArgumentDto
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      getCreateInstructionArgumentInstruction(
        authority,
        program,
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
