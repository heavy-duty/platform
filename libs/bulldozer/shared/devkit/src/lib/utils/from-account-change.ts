import { ReactiveConnection } from '@heavy-duty/rx-solana';
import { PublicKey } from '@solana/web3.js';
import { map, Observable } from 'rxjs';
import { Account, AccountFactory } from '.';

export const fromAccountChange = <
  ResultAccount extends Account<AccountType>,
  AccountType = ResultAccount extends Account<infer Type> ? Type : unknown
>(
  connection: ReactiveConnection,
  publicKey: PublicKey,
  factory: AccountFactory<ResultAccount>
): Observable<ResultAccount | null> =>
  connection
    .onAccountChange$(publicKey)
    .pipe(
      map(({ accountInfo }) =>
        accountInfo.lamports === 0 ? null : factory(publicKey, accountInfo)
      )
    );
