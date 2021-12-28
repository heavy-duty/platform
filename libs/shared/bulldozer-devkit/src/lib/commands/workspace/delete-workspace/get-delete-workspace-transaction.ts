import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getDeleteWorkspaceInstructions } from '.';
import { createTransaction } from '../../../operations';
import { addAllInstructionsToTransaction } from '../../../operators';

export const getDeleteWorkspaceTransaction = (
  connection: Connection,
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  workspaceApplicationPublicKeys: PublicKey[],
  workspaceApplicationCollectionPublicKeys: PublicKey[],
  workspaceApplicationCollectionAttributePublicKeys: PublicKey[],
  workspaceApplicationInstructionPublicKeys: PublicKey[],
  workspaceApplicationInstructionArgumentPublicKeys: PublicKey[],
  workspaceApplicationInstructionAccountPublicKeys: PublicKey[],
  workspaceApplicationInstructionRelationPublicKeys: PublicKey[]
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addAllInstructionsToTransaction(
      getDeleteWorkspaceInstructions(
        authority,
        workspacePublicKey,
        workspaceApplicationPublicKeys,
        workspaceApplicationCollectionPublicKeys,
        workspaceApplicationCollectionAttributePublicKeys,
        workspaceApplicationInstructionPublicKeys,
        workspaceApplicationInstructionArgumentPublicKeys,
        workspaceApplicationInstructionAccountPublicKeys,
        workspaceApplicationInstructionRelationPublicKeys
      )
    )
  );
};
