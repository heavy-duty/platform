import { Connection } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { encodeFilters, getProgramAccounts } from '../../operations';
import {
  Application,
  ApplicationFilters,
  APPLICATION_ACCOUNT_NAME,
  Document,
} from '../../utils';
import { createApplicationDocument } from './utils';

export const getApplications = (
  connection: Connection,
  filters: ApplicationFilters
): Observable<Document<Application>[]> => {
  return getProgramAccounts(connection, {
    commitment: connection.commitment,
    filters: encodeFilters(APPLICATION_ACCOUNT_NAME, filters),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createApplicationDocument(pubkey, account)
      )
    )
  );
};
