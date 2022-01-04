import { Connection, PublicKey } from '@solana/web3.js';
import { map } from 'rxjs/operators';
import {
  fromProgramAccountChange,
  getFiltersByApplication,
} from '../../operations';
import { COLLECTION_ACCOUNT_NAME } from '../../utils';
import { createCollectionDocument } from './utils';

export const onCollectionByApplicationChanges = (
  connection: Connection,
  applicationPublicKey: PublicKey
) =>
  fromProgramAccountChange(connection, {
    commitment: connection.commitment,
    filters: getFiltersByApplication(
      COLLECTION_ACCOUNT_NAME,
      applicationPublicKey
    ),
  }).pipe(
    map(({ keyedAccountInfo }) =>
      createCollectionDocument(
        keyedAccountInfo.accountId,
        keyedAccountInfo.accountInfo
      )
    )
  );
