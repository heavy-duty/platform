import { Program } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getCreateCollectionAttributeInstruction } from '.';
import { createTransaction } from '../../../operations';
import {
  addInstructionToTransaction,
  partialSignTransaction,
} from '../../../operators';
import { CollectionAttributeDto } from '../../../utils';

export const getCreateCollectionAttributeTransaction = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  collectionPublicKey: PublicKey,
  collectionAttributeKeypair: Keypair,
  collectionAttributeDto: CollectionAttributeDto
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      getCreateCollectionAttributeInstruction(
        authority,
        program,
        workspacePublicKey,
        applicationPublicKey,
        collectionPublicKey,
        collectionAttributeKeypair.publicKey,
        collectionAttributeDto
      )
    ),
    partialSignTransaction(collectionAttributeKeypair)
  );
};
