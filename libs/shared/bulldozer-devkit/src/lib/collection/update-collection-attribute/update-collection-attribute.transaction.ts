import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createTransaction } from '../../operations';
import { updateCollectionAttributeInstruction } from './update-collection-attribute.instruction';

export const updateCollectionAttribute = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  collectionAttributePublicKey: PublicKey,
  collectionAttributeName: string
): Observable<{ transaction: Transaction }> => {
  return createTransaction(connection, authority).pipe(
    map((transaction) => {
      transaction.add(
        updateCollectionAttributeInstruction(
          authority,
          program,
          collectionAttributePublicKey,
          collectionAttributeName
        )
      );

      return { transaction };
    })
  );
};
