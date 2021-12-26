import { Program } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createTransaction } from '../../operations';
import { InstructionArgumentDto } from '../../utils';
import { createInstructionArgumentInstruction } from './create-instruction-argument.instruction';

export const createInstructionArgument = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey,
  argumentDto: InstructionArgumentDto
): Observable<{ transaction: Transaction; signers: Keypair[] }> => {
  return createTransaction(connection, authority).pipe(
    map((transaction) => {
      const instructionArgument = Keypair.generate();
      transaction.add(
        createInstructionArgumentInstruction(
          authority,
          program,
          workspacePublicKey,
          applicationPublicKey,
          instructionPublicKey,
          instructionArgument.publicKey,
          argumentDto
        )
      );
      transaction.partialSign(instructionArgument);

      return { transaction, signers: [instructionArgument] };
    })
  );
};
