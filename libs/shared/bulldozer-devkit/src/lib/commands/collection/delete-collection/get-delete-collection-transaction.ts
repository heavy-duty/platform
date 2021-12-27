import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getDeleteCollectionInstructions } from '.';
import { createTransaction } from '../../../operations';
import { addAllInstructionsToTransaction } from '../../../operators';

export const getDeleteCollectionTransaction = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  collectionPublicKey: PublicKey,
  collectionAttributePublicKeys: PublicKey[]
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addAllInstructionsToTransaction(
      getDeleteCollectionInstructions(
        authority,
        program,
        collectionPublicKey,
        collectionAttributePublicKeys
      )
    )
  );
};
