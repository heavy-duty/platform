import { Connection } from '@solana/web3.js';
import { map } from 'rxjs/operators';
import { encodeFilters, fromProgramAccountChange } from '../../operations';
import {
  CollectionAttributeFilters,
  COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
} from '../../utils';
import { createCollectionAttributeDocument } from './utils';

export const onCollectionAttributesChanges = (
  connection: Connection,
  filters: CollectionAttributeFilters
) =>
  fromProgramAccountChange(connection, {
    commitment: connection.commitment,
    filters: encodeFilters(COLLECTION_ATTRIBUTE_ACCOUNT_NAME, filters),
  }).pipe(
    map(({ keyedAccountInfo }) =>
      createCollectionAttributeDocument(
        keyedAccountInfo.accountId,
        keyedAccountInfo.accountInfo
      )
    )
  );
