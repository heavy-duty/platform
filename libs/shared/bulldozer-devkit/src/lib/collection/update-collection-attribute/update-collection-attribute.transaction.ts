import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createTransaction } from '../../operations';
import { CollectionAttributeDto } from '../../utils';
import { updateCollectionAttributeInstruction } from './update-collection-attribute.instruction';

export const updateCollectionAttribute = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  collectionAttributePublicKey: PublicKey,
  collectionAttributeDto: CollectionAttributeDto
): Observable<{ transaction: Transaction }> => {
  return createTransaction(connection, authority).pipe(
    map((transaction) => {
      transaction.add(
        updateCollectionAttributeInstruction(
          authority,
          program,
          collectionAttributePublicKey,
          collectionAttributeDto
        )
      );

      return { transaction };
    })
  );
};
