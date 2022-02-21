import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createUserDocument,
  UserFilters,
  userQueryBuilder,
} from '@heavy-duty/bulldozer-devkit';
import { HdSolanaConnectionStore } from '@heavy-duty/ngx-solana';
import { concatMap, EMPTY, filter, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserEventService {
  constructor(
    private readonly _hdSolanaConnectionStore: HdSolanaConnectionStore
  ) {}

  userDeleted(userId: string): Observable<unknown> {
    return this._hdSolanaConnectionStore
      .onAccountChange(userId, 'finalized')
      .pipe(filter((accountInfo) => accountInfo.lamports === 0));
  }

  userCreated(filters: UserFilters) {
    const query = userQueryBuilder()
      .where(filters)
      .setCommitment('finalized')
      .build();

    return this._hdSolanaConnectionStore
      .onProgramAccountChange(BULLDOZER_PROGRAM_ID.toBase58(), query)
      .pipe(
        concatMap(({ account, pubkey }) => {
          if (account.lamports === 0) {
            return EMPTY;
          } else {
            return of(createUserDocument(pubkey, account));
          }
        })
      );
  }
}
