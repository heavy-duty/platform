import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createCreateInstructionAccountInstruction2,
  createDeleteInstructionAccountInstruction2,
  createInstructionAccountDocument,
  CreateInstructionAccountParams,
  createUpdateInstructionAccountInstruction2,
  DeleteInstructionAccountParams,
  Document,
  encodeFilters,
  getBulldozerError,
  InstructionAccount,
  InstructionAccountFilters,
  INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
  UpdateInstructionAccountParams,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaApiService } from '@heavy-duty/ngx-solana';
import { Keypair, PublicKey } from '@solana/web3.js';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionAccountApiService {
  constructor(private readonly _ngxSolanaApiService: NgxSolanaApiService) {}

  // get instruction accounts
  find(filters: InstructionAccountFilters) {
    return this._ngxSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), {
        filters: encodeFilters(INSTRUCTION_ACCOUNT_ACCOUNT_NAME, filters),
      })
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createInstructionAccountDocument(new PublicKey(pubkey), account)
          )
        )
      );
  }

  // get instruction account
  findById(
    instructionAccountId: string
  ): Observable<Document<InstructionAccount> | null> {
    return this._ngxSolanaApiService
      .getAccountInfo(instructionAccountId)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo &&
            createInstructionAccountDocument(
              new PublicKey(instructionAccountId),
              accountInfo
            )
        )
      );
  }

  // create instruction account
  create(params: Omit<CreateInstructionAccountParams, 'instructionAccountId'>) {
    const instructionAccountKeypair = Keypair.generate();

    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) => {
        transaction.add(
          createCreateInstructionAccountInstruction2({
            ...params,
            instructionAccountId:
              instructionAccountKeypair.publicKey.toBase58(),
          })
        );
        transaction.partialSign(instructionAccountKeypair);
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

  // update instruction account
  update(params: UpdateInstructionAccountParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(createUpdateInstructionAccountInstruction2(params))
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

  // delete instruction account
  delete(params: DeleteInstructionAccountParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(createDeleteInstructionAccountInstruction2(params))
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
