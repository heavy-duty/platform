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
import { Keypair } from '@solana/web3.js';
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

  // get instruction accounts
  find(filters: InstructionAccountFilters) {
    const query = instructionAccountQueryBuilder().where(filters).build();

    return this._hdSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), query)
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createInstructionAccountDocument(pubkey, account)
          )
        )
      );
  }

  // get instruction account
  findById(
    instructionAccountId: string
  ): Observable<Document<InstructionAccount> | null> {
    return this._hdSolanaApiService
      .getAccountInfo(instructionAccountId)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo &&
            createInstructionAccountDocument(instructionAccountId, accountInfo)
        )
      );
  }

  // create instruction account
  create(params: Omit<CreateInstructionAccountParams, 'instructionAccountId'>) {
    const instructionAccountKeypair = Keypair.generate();

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
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }

  // update instruction account
  update(params: UpdateInstructionAccountParams) {
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
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }

  // delete instruction account
  delete(params: DeleteInstructionAccountParams) {
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
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }
}
