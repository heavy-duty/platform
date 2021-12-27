import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getDeleteApplicationInstructions } from '.';
import { createTransaction } from '../../../operations';
import { addAllInstructionsToTransaction } from '../../../operators';

export const getDeleteApplicationTransaction = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  applicationPublicKey: PublicKey,
  applicationCollectionPublicKeys: PublicKey[],
  applicationCollectionAttributePublicKeys: PublicKey[],
  applicationInstructionPublicKeys: PublicKey[],
  applicationInstructionArgumentPublicKeys: PublicKey[],
  applicationInstructionAccountPublicKeys: PublicKey[],
  applicationInstructionRelationPublicKeys: PublicKey[]
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addAllInstructionsToTransaction(
      getDeleteApplicationInstructions(
        authority,
        program,
        applicationPublicKey,
        applicationCollectionPublicKeys,
        applicationCollectionAttributePublicKeys,
        applicationInstructionPublicKeys,
        applicationInstructionArgumentPublicKeys,
        applicationInstructionAccountPublicKeys,
        applicationInstructionRelationPublicKeys
      )
    )
  );
};
