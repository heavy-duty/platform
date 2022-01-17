import { getAccountInfo } from '@heavy-duty/rx-solana';
import { Connection, PublicKey } from '@solana/web3.js';
import { map, Observable } from 'rxjs';
import { Application, createApplicationDocument, Document } from '../../utils';

export const getApplication = (
  connection: Connection,
  applicationPublicKey: PublicKey
): Observable<Document<Application> | null> => {
  return getAccountInfo(connection, applicationPublicKey).pipe(
    map(
      (account) =>
        account && createApplicationDocument(applicationPublicKey, account)
    )
  );
};
