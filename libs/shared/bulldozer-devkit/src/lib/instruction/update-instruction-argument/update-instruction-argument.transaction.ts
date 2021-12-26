import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createTransaction } from '../../operations';
import { InstructionArgumentDto } from '../../utils';
import { updateInstructionArgumentInstruction } from './update-instruction-argument.instruction';

export const updateInstructionArgument = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  instructionArgumentPublicKey: PublicKey,
  instructionArgumentDto: InstructionArgumentDto
): Observable<{ transaction: Transaction }> => {
  return createTransaction(connection, authority).pipe(
    map((transaction) => {
      transaction.add(
        updateInstructionArgumentInstruction(
          authority,
          program,
          instructionArgumentPublicKey,
          instructionArgumentDto
        )
      );

      return { transaction };
    })
  );
};
