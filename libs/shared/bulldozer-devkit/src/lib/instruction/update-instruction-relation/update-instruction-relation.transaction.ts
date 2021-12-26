import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createTransaction } from '../../operations';
import { updateInstructionRelationInstruction } from './update-instruction-relation.instruction';

export const updateInstructionRelation = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  instructionRelationPublicKey: PublicKey,
  fromPublicKey: PublicKey,
  toPublicKey: PublicKey
): Observable<{ transaction: Transaction }> => {
  return createTransaction(connection, authority).pipe(
    map((transaction) => {
      transaction.add(
        updateInstructionRelationInstruction(
          authority,
          program,
          instructionRelationPublicKey,
          fromPublicKey,
          toPublicKey
        )
      );

      return { transaction };
    })
  );
};
