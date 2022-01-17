import { getProgramAccounts } from '@heavy-duty/rx-solana';
import { Connection } from '@solana/web3.js';
import { map, Observable } from 'rxjs';
import {
  Application,
  ApplicationFilters,
  APPLICATION_ACCOUNT_NAME,
  BULLDOZER_PROGRAM_ID,
  createApplicationDocument,
  Document,
  encodeFilters,
} from '../../utils';

export const getApplications = (
  connection: Connection,
  filters: ApplicationFilters
): Observable<Document<Application>[]> => {
  return getProgramAccounts(connection, BULLDOZER_PROGRAM_ID, {
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
