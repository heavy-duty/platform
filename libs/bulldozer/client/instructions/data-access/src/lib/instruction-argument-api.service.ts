import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createInstructionArgument,
  createInstructionArgumentDocument,
  CreateInstructionArgumentParams,
  deleteInstructionArgument,
  DeleteInstructionArgumentParams,
  Document,
  InstructionArgument,
  InstructionArgumentFilters,
  instructionArgumentQueryBuilder,
  parseBulldozerError,
  updateInstructionArgument,
  UpdateInstructionArgumentParams,
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
export class InstructionArgumentApiService {
  constructor(
    private readonly _hdSolanaApiService: HdSolanaApiService,
    private readonly _hdSolanaConfigStore: HdSolanaConfigStore
  ) {}

  private handleError(error: string) {
    return throwError(() => parseBulldozerError(error) ?? null);
  }

  // get instruction argument ids
  findIds(
    filters: InstructionArgumentFilters,
    commitment: Finality = 'finalized'
  ) {
    const query = instructionArgumentQueryBuilder().where(filters).build();

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

  // get instruction argument
  findById(
    instructionArgumentId: string,
    commitment: Finality = 'finalized'
  ): Observable<Document<InstructionArgument> | null> {
    return this._hdSolanaApiService
      .getAccountInfo(instructionArgumentId, commitment)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo &&
            createInstructionArgumentDocument(
              instructionArgumentId,
              accountInfo
            )
        )
      );
  }

  // get instruction arguments
  findByIds(
    instructionArgumentIds: string[],
    commitment: Finality = 'finalized'
  ) {
    return this._hdSolanaApiService
      .getMultipleAccounts(instructionArgumentIds, { commitment })
      .pipe(
        map((keyedAccounts) =>
          keyedAccounts.map(
            (keyedAccount) =>
              keyedAccount &&
              createInstructionArgumentDocument(
                keyedAccount.accountId,
                keyedAccount.accountInfo
              )
          )
        )
      );
  }

  // create instruction argument
  create(
    params: Omit<CreateInstructionArgumentParams, 'instructionArgumentId'>
  ): Observable<{
    transactionSignature: TransactionSignature;
    transaction: Transaction;
  }> {
    const instructionArgumentKeypair = Keypair.generate();

    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return createInstructionArgument(apiEndpoint, {
              ...params,
              instructionArgumentId:
                instructionArgumentKeypair.publicKey.toBase58(),
            });
          })
        )
      ),
      partiallySignTransaction(instructionArgumentKeypair),
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

  // update instruction argument
  update(params: UpdateInstructionArgumentParams): Observable<{
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

            return updateInstructionArgument(apiEndpoint, params);
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

  // delete instruction argument
  delete(params: DeleteInstructionArgumentParams): Observable<{
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

            return deleteInstructionArgument(apiEndpoint, params);
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
