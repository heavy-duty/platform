import { Injectable } from '@angular/core';
import {
  Budget,
  BUDGET_ACCOUNT_SIZE,
  createBudgetDocument,
  depositToBudget,
  DepositToBudgetParams,
  Document,
  parseBulldozerError,
  withdrawFromBudget,
  WithdrawFromBudgetParams,
} from '@heavy-duty/bulldozer-devkit';
import {
  HdSolanaApiService,
  HdSolanaConfigStore,
} from '@heavy-duty/ngx-solana';
import { addInstructionToTransaction } from '@heavy-duty/rx-solana';
import { Finality } from '@solana/web3.js';
import {
  catchError,
  concatMap,
  first,
  map,
  Observable,
  throwError,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BudgetApiService {
  constructor(
    private readonly _hdSolanaApiService: HdSolanaApiService,
    private readonly _hdSolanaConfigStore: HdSolanaConfigStore
  ) {}

  private handleError(error: string) {
    return throwError(() => parseBulldozerError(error) ?? null);
  }

  // get budget
  findById(
    budgetId: string,
    commitment: Finality = 'finalized'
  ): Observable<Document<Budget> | null> {
    return this._hdSolanaApiService
      .getAccountInfo(budgetId, commitment)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo && createBudgetDocument(budgetId, accountInfo)
        )
      );
  }

  depositToBudget(params: DepositToBudgetParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return depositToBudget(apiEndpoint, params);
          })
        )
      ),
      concatMap((transaction) =>
        this._hdSolanaApiService.sendTransaction(transaction).pipe(
          map((transactionSignature) => ({
            transactionSignature,
            transaction,
          })),
          catchError((error) => this.handleError(error))
        )
      )
    );
  }

  withdrawFromBudget(params: WithdrawFromBudgetParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return withdrawFromBudget(apiEndpoint, params);
          })
        )
      ),
      concatMap((transaction) =>
        this._hdSolanaApiService.sendTransaction(transaction).pipe(
          map((transactionSignature) => ({
            transactionSignature,
            transaction,
          })),
          catchError((error) => this.handleError(error))
        )
      )
    );
  }

  getMinimumBalanceForRentExemption() {
    return this._hdSolanaApiService.getMinimumBalanceForRentExemption(
      BUDGET_ACCOUNT_SIZE
    );
  }
}
