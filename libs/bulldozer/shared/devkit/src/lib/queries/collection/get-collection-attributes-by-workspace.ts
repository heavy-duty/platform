import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getFiltersByWorkspace, getProgramAccounts } from '../../operations';
import { BULLDOZER_PROGRAM_ID } from '../../programs';
import {
  CollectionAttribute,
  COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
  Document,
} from '../../utils';
import { createCollectionAttributeDocument } from './utils';

export const getCollectionAttributesByWorkspace = (
  connection: Connection,
  workspacePublicKey: PublicKey
): Observable<Document<CollectionAttribute>[]> => {
  return getProgramAccounts(connection, BULLDOZER_PROGRAM_ID, {
    commitment: connection.commitment,
    filters: getFiltersByWorkspace(
      COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
      workspacePublicKey
    ),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createCollectionAttributeDocument(pubkey, account.data)
      )
    )
  );
};
