import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createInstructionRelation,
  CreateInstructionRelationParams,
  createInstructionRelationRelation,
  deleteInstructionRelation,
  DeleteInstructionRelationParams,
  findInstructionRelationAddress,
  getBulldozerError,
  InstructionRelation,
  InstructionRelationFilters,
  instructionRelationQueryBuilder,
  Relation,
  updateInstructionRelation,
  UpdateInstructionRelationParams,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaApiService } from '@heavy-duty/ngx-solana';
import { catchError, concatMap, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionRelationApiService {
  constructor(private readonly _ngxSolanaApiService: NgxSolanaApiService) {}

  // get instructions
  find(filters: InstructionRelationFilters) {
    const query = instructionRelationQueryBuilder().where(filters).build();

    return this._ngxSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), query)
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createInstructionRelationRelation(pubkey, account)
          )
        )
      );
  }

  // get instruction
  findById(
    instructionRelationId: string
  ): Observable<Relation<InstructionRelation> | null> {
    return this._ngxSolanaApiService
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

  // create instruction
  create(
    params: Omit<
      CreateInstructionRelationParams,
      'instructionRelationId' | 'instructionRelationBump'
    >
  ) {
    return findInstructionRelationAddress(
      params.fromAccountId,
      params.toAccountId
    ).pipe(
      concatMap(([instructionRelationId, instructionRelationBump]) => {
        return this._ngxSolanaApiService.createAndSendTransaction(
          params.authority,
          (transaction) =>
            transaction.add(
              createInstructionRelation({
                ...params,
                instructionRelationId,
                instructionRelationBump,
              })
            )
        );
      }),
      catchError((error) => {
        if (
          'InstructionError' in error &&
          error.InstructionError.length === 2 &&
          typeof error.InstructionError[1].Custom === 'number'
        ) {
          return throwError(() =>
            getBulldozerError(error.InstructionError[1].Custom)
          );
        }

        return throwError(() => error);
      })
    );
  }

  // update instruction
  update(params: UpdateInstructionRelationParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(updateInstructionRelation(params))
      )
      .pipe(
        catchError((error) =>
          throwError(() =>
            typeof error === 'number' ? getBulldozerError(error) : error
          )
        )
      );
  }

  // delete instruction
  delete(params: DeleteInstructionRelationParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(deleteInstructionRelation(params))
      )
      .pipe(
        catchError((error) =>
          throwError(() =>
            typeof error === 'number' ? getBulldozerError(error) : error
          )
        )
      );
  }
}
