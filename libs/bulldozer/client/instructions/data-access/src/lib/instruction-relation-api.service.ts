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
  find(filters: InstructionRelationFilters) {
    const query = instructionRelationQueryBuilder().where(filters).build();

    return this._hdSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), query)
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createInstructionRelationRelation(pubkey, account)
          )
        )
      );
  }

  // get instruction relation
  findById(
    instructionRelationId: string
  ): Observable<Relation<InstructionRelation> | null> {
    return this._hdSolanaApiService
      .getAccountInfo(instructionRelationId)
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
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
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
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }
}
