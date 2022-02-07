import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createCreateInstructionInstruction2,
  createDeleteInstructionInstruction2,
  createInstructionDocument,
  CreateInstructionParams,
  createUpdateInstructionBodyInstruction2,
  createUpdateInstructionInstruction2,
  DeleteInstructionParams,
  Document,
  encodeFilters,
  getBulldozerError,
  Instruction,
  InstructionFilters,
  INSTRUCTION_ACCOUNT_NAME,
  UpdateInstructionBodyParams,
  UpdateInstructionParams,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaApiService } from '@heavy-duty/ngx-solana';
import { Keypair, PublicKey } from '@solana/web3.js';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionApiService {
  constructor(private readonly _ngxSolanaApiService: NgxSolanaApiService) {}

  // get instructions
  find(filters: InstructionFilters) {
    return this._ngxSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), {
        filters: encodeFilters(INSTRUCTION_ACCOUNT_NAME, filters),
      })
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createInstructionDocument(new PublicKey(pubkey), account)
          )
        )
      );
  }

  // get instruction
  findById(instructionId: string): Observable<Document<Instruction> | null> {
    return this._ngxSolanaApiService
      .getAccountInfo(instructionId)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo &&
            createInstructionDocument(new PublicKey(instructionId), accountInfo)
        )
      );
  }

  // create instruction
  create(params: Omit<CreateInstructionParams, 'instructionId'>) {
    const instructionKeypair = Keypair.generate();

    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) => {
        transaction.add(
          createCreateInstructionInstruction2({
            ...params,
            instructionId: instructionKeypair.publicKey.toBase58(),
          })
        );
        transaction.partialSign(instructionKeypair);
        return transaction;
      })
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

  // update instruction
  update(params: UpdateInstructionParams) {
    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) =>
        transaction.add(createUpdateInstructionInstruction2(params))
    );
  }

  // update instruction body
  updateBody(params: UpdateInstructionBodyParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(createUpdateInstructionBodyInstruction2(params))
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
  delete(params: DeleteInstructionParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(createDeleteInstructionInstruction2(params))
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
