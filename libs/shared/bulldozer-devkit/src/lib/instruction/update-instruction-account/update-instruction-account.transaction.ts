import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
  return from(
    defer(() => connection.getRecentBlockhash(connection.commitment))
  ).pipe(
    map(({ blockhash }) => {
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: authority,
      }).add(
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
