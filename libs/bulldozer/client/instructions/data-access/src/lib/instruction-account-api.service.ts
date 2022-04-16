import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createInstructionAccount,
  createInstructionAccountDocument,
  CreateInstructionAccountParams,
  deleteInstructionAccount,
  DeleteInstructionAccountParams,
  Document,
  InstructionAccount,
  InstructionAccountFilters,
  instructionAccountQueryBuilder,
  parseBulldozerError,
  updateInstructionAccount,
  UpdateInstructionAccountParams,
} from '@heavy-duty/bulldozer-devkit';
import {
  HdSolanaApiService,
  HdSolanaConfigStore,
} from '@heavy-duty/ngx-solana';
import {
  addInstructionToTransaction,
  partiallySignTransaction,
} from '@heavy-duty/rx-solana';
import {
  Finality,
  Keypair,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js';
import {
  catchError,
  concatMap,
  first,
  map,
  Observable,
  throwError,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionAccountApiService {
  constructor(
    private readonly _hdSolanaApiService: HdSolanaApiService,
    private readonly _hdSolanaConfigStore: HdSolanaConfigStore
  ) {}

  private handleError(error: string) {
    return throwError(() => parseBulldozerError(error) ?? null);
  }

  // get instruction account ids
  findIds(
    filters: InstructionAccountFilters,
    commitment: Finality = 'finalized'
  ) {
    const query = instructionAccountQueryBuilder().where(filters).build();

    return this._hdSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), {
        ...query,
        dataSlice: {
          offset: 0,
          length: 0,
        },
        commitment,
      })
      .pipe(
        map((programAccounts) => programAccounts.map(({ pubkey }) => pubkey))
      );
  }

  // get instruction account
  findById(
    instructionAccountId: string,
    commitment: Finality = 'finalized'
  ): Observable<Document<InstructionAccount> | null> {
    return this._hdSolanaApiService
      .getAccountInfo(instructionAccountId, commitment)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo &&
            createInstructionAccountDocument(instructionAccountId, accountInfo)
        )
      );
  }

  // get instruction accounts
  findByIds(
    instructionAccountIds: string[],
    commitment: Finality = 'finalized'
  ) {
    return this._hdSolanaApiService
      .getMultipleAccounts(instructionAccountIds, { commitment })
      .pipe(
        map((keyedAccounts) =>
          keyedAccounts.map(
            (keyedAccount) =>
              keyedAccount &&
              createInstructionAccountDocument(
                keyedAccount.accountId,
                keyedAccount.accountInfo
              )
          )
        )
      );
  }

  // create instruction account
  create(
    instructionAccountKeypair: Keypair,
    params: Omit<CreateInstructionAccountParams, 'instructionAccountId'>
  ): Observable<{
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

            return createInstructionAccount(apiEndpoint, {
              ...params,
              instructionAccountId:
                instructionAccountKeypair.publicKey.toBase58(),
            });
          })
        )
      ),
      partiallySignTransaction(instructionAccountKeypair),
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

  // update instruction account
  update(params: UpdateInstructionAccountParams): Observable<{
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

            return updateInstructionAccount(apiEndpoint, params);
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

  // delete instruction account
  delete(params: DeleteInstructionAccountParams): Observable<{
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

            return deleteInstructionAccount(apiEndpoint, params);
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
