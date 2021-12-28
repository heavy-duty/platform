import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getDeleteCollectionInstructions } from '.';
import { createTransaction } from '../../../operations';
import { addAllInstructionsToTransaction } from '../../../operators';

export const getDeleteCollectionTransaction = (
  connection: Connection,
  authority: PublicKey,
  collectionPublicKey: PublicKey,
  collectionAttributePublicKeys: PublicKey[]
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addAllInstructionsToTransaction(
      getDeleteCollectionInstructions(
        authority,
        collectionPublicKey,
        collectionAttributePublicKeys
      )
    )
  );
};
