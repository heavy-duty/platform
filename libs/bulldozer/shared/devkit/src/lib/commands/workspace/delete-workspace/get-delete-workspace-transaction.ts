import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getDeleteWorkspaceInstructions } from '.';
import { createTransaction } from '../../../operations';
import { addAllInstructionsToTransaction } from '../../../operators';

export const getDeleteWorkspaceTransaction = (
  connection: Connection,
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKeys: PublicKey[],
  collectionPublicKeys: PublicKey[],
  collectionAttributePublicKeys: PublicKey[],
  instructionPublicKeys: PublicKey[],
  instructionArgumentPublicKeys: PublicKey[],
  instructionAccountPublicKeys: PublicKey[],
  instructionRelationPublicKeys: PublicKey[]
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addAllInstructionsToTransaction(
      getDeleteWorkspaceInstructions(
        authority,
        workspacePublicKey,
        applicationPublicKeys,
        collectionPublicKeys,
        collectionAttributePublicKeys,
        instructionPublicKeys,
        instructionArgumentPublicKeys,
        instructionAccountPublicKeys,
        instructionRelationPublicKeys
      )
    )
  );
};
