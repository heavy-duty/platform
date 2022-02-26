import { Injectable } from '@angular/core';
import {
  Budget,
  BudgetFilters,
  budgetQueryBuilder,
  BUDGET_ACCOUNT_SIZE,
  BULLDOZER_PROGRAM_ID,
  createBudgetDocument,
  depositToBudget,
  DepositToBudgetParams,
  Document,
  parseBulldozerError,
} from '@heavy-duty/bulldozer-devkit';
import { HdSolanaApiService } from '@heavy-duty/ngx-solana';
import { addInstructionToTransaction } from '@heavy-duty/rx-solana';
import { catchError, concatMap, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BudgetApiService {
  constructor(private readonly _hdSolanaApiService: HdSolanaApiService) {}

  private handleError(error: string) {
    return throwError(() => parseBulldozerError(error) ?? null);
  }

  // get budgets
  find(filters: BudgetFilters) {
    const query = budgetQueryBuilder().where(filters).build();

    return this._hdSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), query)
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createBudgetDocument(pubkey, account)
          )
        )
      );
  }

  // get budget
  findById(budgetId: string): Observable<Document<Budget> | null> {
    return this._hdSolanaApiService
      .getAccountInfo(budgetId)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo && createBudgetDocument(budgetId, accountInfo)
        )
      );
  }

  // deposit
  depositToBudget(params: DepositToBudgetParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(depositToBudget(params)),
      concatMap((transaction) =>
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }

  getMinimumBalanceForRentExemption() {
    return this._hdSolanaApiService.getMinimumBalanceForRentExemption(
      BUDGET_ACCOUNT_SIZE
    );
  }
}
