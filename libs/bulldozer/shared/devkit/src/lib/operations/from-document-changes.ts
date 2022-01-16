import { AccountInfo, PublicKey } from '@solana/web3.js';
import { map, Observable } from 'rxjs';
import { ReactiveConnection } from '../reactive-connection';
import { Document } from '../utils';

export const fromDocumentChanges = <T>(
  connection: ReactiveConnection,
  publicKey: PublicKey,
  factory: (
    publicKey: PublicKey,
    accountInfo: AccountInfo<Buffer>
  ) => Document<T>
): Observable<Document<T> | null> =>
  connection
    .onAccountChange$(publicKey)
    .pipe(
      map(({ accountInfo }) =>
        accountInfo.lamports === 0 ? null : factory(publicKey, accountInfo)
      )
    );
