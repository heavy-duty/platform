import { Injectable } from '@angular/core';
import {
  createUser,
  createUserDocument,
  CreateUserParams,
  deleteUser,
  DeleteUserParams,
  Document,
  parseBulldozerError,
  updateUser,
  UpdateUserParams,
  User,
} from '@heavy-duty/bulldozer-devkit';
import {
  HdSolanaApiService,
  HdSolanaConfigStore,
} from '@heavy-duty/ngx-solana';
import { addInstructionToTransaction } from '@heavy-duty/rx-solana';
import { Finality, Transaction, TransactionSignature } from '@solana/web3.js';
import {
  catchError,
  concatMap,
  first,
  map,
  Observable,
  throwError,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  constructor(
    private readonly _hdSolanaApiService: HdSolanaApiService,
    private readonly _hdSolanaConfigStore: HdSolanaConfigStore
  ) {}

  private handleError(error: string) {
    return throwError(() => parseBulldozerError(error) ?? null);
  }

  // get user
  findById(
    userId: string,
    commitment: Finality = 'finalized'
  ): Observable<Document<User> | null> {
    return this._hdSolanaApiService
      .getAccountInfo(userId, commitment)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo && createUserDocument(userId, accountInfo)
        )
      );
  }

  // get users
  findByIds(
    userIds: string[],
    commitment: Finality = 'finalized'
  ): Observable<(Document<User> | null)[]> {
    return this._hdSolanaApiService
      .getMultipleAccounts(userIds, { commitment })
      .pipe(
        map((keyedAccounts) =>
          keyedAccounts.map(
            (keyedAccount) =>
              keyedAccount &&
              createUserDocument(
                keyedAccount.accountId,
                keyedAccount.accountInfo
              )
          )
        )
      );
  }

  // create user
  create(params: CreateUserParams): Observable<{
    transactionSignature: TransactionSignature;
    transaction: Transaction;
  }> {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return createUser(apiEndpoint, params);
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

  // update user
  update(params: UpdateUserParams): Observable<{
    transactionSignature: TransactionSignature;
    transaction: Transaction;
  }> {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return updateUser(apiEndpoint, params);
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

  // delete user
  delete(params: DeleteUserParams): Observable<{
    transactionSignature: TransactionSignature;
    transaction: Transaction;
  }> {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return deleteUser(apiEndpoint, params);
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
}
