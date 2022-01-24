import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getAccountInfo } from '../../operations';
import { Application, Document } from '../../utils';
import { createApplicationDocument } from './utils';

export const getApplication = (
  connection: Connection,
  applicationPublicKey: PublicKey
): Observable<Document<Application> | null> => {
  return getAccountInfo(connection, applicationPublicKey).pipe(
    map(
      (account) =>
        account && createApplicationDocument(applicationPublicKey, account.data)
    )
  );
};
