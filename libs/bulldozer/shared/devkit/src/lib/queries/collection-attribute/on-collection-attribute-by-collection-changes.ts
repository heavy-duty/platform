import { Connection, PublicKey } from '@solana/web3.js';
import { map } from 'rxjs/operators';
import {
  fromProgramAccountChange,
  getFiltersByCollection,
} from '../../operations';
import { COLLECTION_ATTRIBUTE_ACCOUNT_NAME } from '../../utils';
import { createCollectionAttributeDocument } from './utils';

export const onCollectionAttributeByCollectionChanges = (
  connection: Connection,
  collectionPublicKey: PublicKey
) =>
  fromProgramAccountChange(connection, {
    commitment: connection.commitment,
    filters: getFiltersByCollection(
      COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
      collectionPublicKey
    ),
  }).pipe(
    map(({ keyedAccountInfo }) =>
      createCollectionAttributeDocument(
        keyedAccountInfo.accountId,
        keyedAccountInfo.accountInfo
      )
    )
  );
