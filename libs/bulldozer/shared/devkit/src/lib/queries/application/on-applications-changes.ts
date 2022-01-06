import { Connection } from '@solana/web3.js';
import { map } from 'rxjs/operators';
import { encodeFilters, fromProgramAccountChange } from '../../operations';
import { ApplicationFilters, APPLICATION_ACCOUNT_NAME } from '../../utils';
import { createApplicationDocument } from './utils';

export const onApplicationsChanges = (
  connection: Connection,
  filters: ApplicationFilters
) =>
  fromProgramAccountChange(connection, {
    commitment: connection.commitment,
    filters: encodeFilters(APPLICATION_ACCOUNT_NAME, filters),
  }).pipe(
    map(({ keyedAccountInfo }) =>
      createApplicationDocument(
        keyedAccountInfo.accountId,
        keyedAccountInfo.accountInfo
      )
    )
  );
