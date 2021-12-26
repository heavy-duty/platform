import { Program } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import {
  createTransaction,
  findInstructionRelationAddress,
} from '../../operations';
import { createInstructionRelationInstruction } from './create-instruction-relation.instruction';

export const createInstructionRelation = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey,
  fromAccount: PublicKey,
  toAccount: PublicKey
): Observable<{ transaction: Transaction; signers: Keypair[] }> => {
  return createTransaction(connection, authority).pipe(
    concatMap((transaction) =>
      findInstructionRelationAddress(fromAccount, toAccount).pipe(
        map(([relationPublicKey, relationBump]) => {
          const instructionRelation = Keypair.generate();
          transaction.add(
            createInstructionRelationInstruction(
              authority,
              program,
              workspacePublicKey,
              applicationPublicKey,
              instructionPublicKey,
              relationPublicKey,
              relationBump,
              fromAccount,
              toAccount
            )
          );
          transaction.partialSign(instructionRelation);

          return { transaction, signers: [instructionRelation] };
        })
      )
    )
  );
};
