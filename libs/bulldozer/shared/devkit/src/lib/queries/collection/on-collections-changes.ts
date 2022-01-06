import { Connection } from '@solana/web3.js';
import { map } from 'rxjs/operators';
import { encodeFilters, fromProgramAccountChange } from '../../operations';
import { CollectionFilters, COLLECTION_ACCOUNT_NAME } from '../../utils';
import { createCollectionDocument } from './utils';

export const onCollectionsChanges = (
  connection: Connection,
  filters: CollectionFilters
) =>
  fromProgramAccountChange(connection, {
    commitment: connection.commitment,
    filters: encodeFilters(COLLECTION_ACCOUNT_NAME, filters),
  }).pipe(
    map(({ keyedAccountInfo }) =>
      createCollectionDocument(
        keyedAccountInfo.accountId,
        keyedAccountInfo.accountInfo
      )
    )
  );
