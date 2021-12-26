import { Program } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CollectionAttributeDto } from '../../utils';
import { createCollectionAttributeInstruction } from './create-collection-attribute.instruction';

export const createCollectionAttribute = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  collectionPublicKey: PublicKey,
  attributeDto: CollectionAttributeDto
): Observable<{ transaction: Transaction; signers: Keypair[] }> => {
  return from(
    defer(() => connection.getRecentBlockhash(connection.commitment))
  ).pipe(
    map(({ blockhash }) => {
      const collectionAttribute = Keypair.generate();
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: authority,
      }).add(
        createCollectionAttributeInstruction(
          authority,
          program,
          workspacePublicKey,
          applicationPublicKey,
          collectionPublicKey,
          collectionAttribute.publicKey,
          attributeDto
        )
      );
      transaction.partialSign(collectionAttribute);

      return { transaction, signers: [collectionAttribute] };
    })
  );
};
