import { ReactiveConnection } from '@heavy-duty/rx-solana';
import { PublicKey } from '@solana/web3.js';
import { concatMap, EMPTY, Observable, of } from 'rxjs';
import {
  Account,
  AccountFactory,
  AccountName,
  BULLDOZER_PROGRAM_ID,
  encodeFilters,
  Filters,
} from '.';

export const fromAccountCreated = <
  ResultAccount extends Account<AccountType>,
  AccountType = ResultAccount extends Account<infer Type> ? Type : unknown
>(
  connection: ReactiveConnection,
  filters: Filters,
  accountName: AccountName,
  factory: AccountFactory<ResultAccount>
): Observable<ResultAccount> =>
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
          const account = factory(publicKey, accountInfo);

          if (account.createdAt.eq(account.updatedAt)) {
            return of(account);
          } else {
            return EMPTY;
          }
        }
      })
    );
