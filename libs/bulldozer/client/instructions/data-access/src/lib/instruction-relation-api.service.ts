import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createCreateInstructionRelationInstruction2,
  createDeleteInstructionRelationInstruction2,
  CreateInstructionRelationParams,
  createInstructionRelationRelation,
  createUpdateInstructionRelationInstruction2,
  DeleteInstructionRelationParams,
  encodeFilters,
  findInstructionRelationAddress,
  getBulldozerError,
  InstructionRelation,
  InstructionRelationFilters,
  INSTRUCTION_RELATION_ACCOUNT_NAME,
  Relation,
  UpdateInstructionRelationParams,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaApiService } from '@heavy-duty/ngx-solana';
import { PublicKey } from '@solana/web3.js';
import { catchError, concatMap, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionRelationApiService {
  constructor(private readonly _ngxSolanaApiService: NgxSolanaApiService) {}

  // get instructions
  find(filters: InstructionRelationFilters) {
    return this._ngxSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), {
        filters: encodeFilters(INSTRUCTION_RELATION_ACCOUNT_NAME, filters),
      })
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createInstructionRelationRelation(new PublicKey(pubkey), account)
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
              new PublicKey(instructionRelationId),
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
      new PublicKey(params.fromAccountId),
      new PublicKey(params.toAccountId)
    ).pipe(
      concatMap(([instructionRelationPublicKey, instructionRelationBump]) => {
        return this._ngxSolanaApiService.createAndSendTransaction(
          params.authority,
          (transaction) =>
            transaction.add(
              createCreateInstructionRelationInstruction2({
                ...params,
                instructionRelationId: instructionRelationPublicKey.toBase58(),
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
        transaction.add(createUpdateInstructionRelationInstruction2(params))
      )
      .pipe(
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

  // delete instruction
  delete(params: DeleteInstructionRelationParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(createDeleteInstructionRelationInstruction2(params))
      )
      .pipe(
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
}
