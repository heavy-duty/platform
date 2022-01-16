import { AccountInfo, PublicKey } from '@solana/web3.js';
import { concatMap, EMPTY, Observable, of } from 'rxjs';
import { encodeFilters } from '.';
import { BULLDOZER_PROGRAM_ID } from '../programs';
import { ReactiveConnection } from '../reactive-connection';
import { AccountName, Document, Filters } from '../utils';

export const fromDocumentCreated = <T>(
  connection: ReactiveConnection,
  filters: Filters,
  accountName: AccountName,
  factory: (
    publicKey: PublicKey,
    accountInfo: AccountInfo<Buffer>
  ) => Document<T>
): Observable<Document<T>> =>
  connection
    .onProgramAccountChange$(
      new PublicKey(BULLDOZER_PROGRAM_ID),
      undefined,
      encodeFilters(accountName, filters)
    )
    .pipe(
      concatMap(({ accountInfo, publicKey }) => {
        if (accountInfo.lamports === 0) {
          return EMPTY;
        } else {
          const document = factory(publicKey, accountInfo);

          if (document.createdAt.eq(document.updatedAt)) {
            return of(document);
          } else {
            return EMPTY;
          }
        }
      })
    );
