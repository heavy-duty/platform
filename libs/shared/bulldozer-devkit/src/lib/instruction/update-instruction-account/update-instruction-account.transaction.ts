import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createTransaction } from '../../operations';
import { InstructionAccountDto, InstructionAccountExtras } from '../../utils';
import { updateInstructionAccountInstruction } from './update-instruction-account.instruction';

export const updateInstructionAccount = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  instructionAccountPublicKey: PublicKey,
  instructionAccountDto: InstructionAccountDto,
  instructionAccountExtras: InstructionAccountExtras
): Observable<{ transaction: Transaction }> => {
  return createTransaction(connection, authority).pipe(
    map((transaction) => {
      transaction.add(
        updateInstructionAccountInstruction(
          authority,
          program,
          instructionAccountPublicKey,
          instructionAccountDto,
          instructionAccountExtras
        )
      );

      return { transaction };
    })
  );
};
