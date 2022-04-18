import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createInstructionRelation,
  CreateInstructionRelationParams,
  createInstructionRelationRelation,
  deleteInstructionRelation,
  DeleteInstructionRelationParams,
  InstructionRelation,
  InstructionRelationFilters,
  instructionRelationQueryBuilder,
  parseBulldozerError,
  Relation,
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
export class InstructionRelationApiService {
  constructor(
    private readonly _hdSolanaApiService: HdSolanaApiService,
    private readonly _hdSolanaConfigStore: HdSolanaConfigStore
  ) {}

  private handleError(error: string) {
    return throwError(() => parseBulldozerError(error) ?? null);
  }

  // get instruction relations
  findIds(
    filters: InstructionRelationFilters,
    commitment: Finality = 'finalized'
  ) {
    const query = instructionRelationQueryBuilder().where(filters).build();

    return this._hdSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), {
        ...query,
        commitment,
        dataSlice: { offset: 0, length: 0 },
      })
      .pipe(
        map((programAccounts) => programAccounts.map(({ pubkey }) => pubkey))
      );
  }

  // get instruction relation
  findById(
    instructionRelationId: string,
    commitment: Finality = 'finalized'
  ): Observable<Relation<InstructionRelation> | null> {
    return this._hdSolanaApiService
      .getAccountInfo(instructionRelationId, commitment)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo &&
            createInstructionRelationRelation(
              instructionRelationId,
              accountInfo
            )
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
              createInstructionRelationRelation(
                keyedAccount.accountId,
                keyedAccount.accountInfo
              )
          )
        )
      );
  }

  // create instruction relation
  create(params: CreateInstructionRelationParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return createInstructionRelation(apiEndpoint, params);
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

  // delete instruction relation
  delete(params: DeleteInstructionRelationParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return deleteInstructionRelation(apiEndpoint, params);
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
