import { Injectable } from '@angular/core';
import {
  Budget,
  BudgetFilters,
  budgetQueryBuilder,
  BULLDOZER_PROGRAM_ID,
  createBudgetDocument,
  Document,
} from '@heavy-duty/bulldozer-devkit';
import { HdSolanaConnectionStore } from '@heavy-duty/ngx-solana';
import { concatMap, EMPTY, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BudgetEventService {
  constructor(
    private readonly _hdSolanaConnectionStore: HdSolanaConnectionStore
  ) {}

  budgetChanges(budgetId: string): Observable<Document<Budget> | null> {
    return this._hdSolanaConnectionStore
      .onAccountChange(budgetId)
      .pipe(
        map((accountInfo) =>
          accountInfo.lamports > 0
            ? createBudgetDocument(budgetId, accountInfo)
            : null
        )
      );
  }

  budgetCreated(filters: BudgetFilters) {
    const query = budgetQueryBuilder()
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
            const document = createBudgetDocument(pubkey, account);

            if (
              document.updatedAt !== undefined &&
              document.createdAt.eq(document.updatedAt)
            ) {
              return of(document);
            } else {
              return EMPTY;
            }
          }
        })
      );
  }
}
