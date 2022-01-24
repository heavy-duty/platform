import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getDeleteInstructionInstructions } from '.';
import { createTransaction } from '../../../operations';
import { addAllInstructionsToTransaction } from '../../../operators';

export const getDeleteInstructionTransaction = (
  connection: Connection,
  authority: PublicKey,
  instructionPublicKey: PublicKey,
  instructionArgumentPublicKeys: PublicKey[],
  instructionAccountPublicKeys: PublicKey[],
  instructionRelationPublicKeys: PublicKey[]
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addAllInstructionsToTransaction(
      getDeleteInstructionInstructions(
        authority,
        instructionPublicKey,
        instructionArgumentPublicKeys,
        instructionAccountPublicKeys,
        instructionRelationPublicKeys
      )
    )
  );
};
