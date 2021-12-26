import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { updateCollectionAttributeInstruction } from './update-collection-attribute.instruction';

export const updateCollectionAttribute = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  collectionAttributePublicKey: PublicKey,
  collectionAttributeName: string
): Observable<{ transaction: Transaction }> => {
  return from(
    defer(() => connection.getRecentBlockhash(connection.commitment))
  ).pipe(
    map(({ blockhash }) => {
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: authority,
      }).add(
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
