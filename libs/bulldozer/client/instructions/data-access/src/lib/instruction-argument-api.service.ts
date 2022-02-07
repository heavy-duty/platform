import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createCreateInstructionArgumentInstruction2,
  createDeleteInstructionArgumentInstruction2,
  createInstructionArgumentDocument,
  CreateInstructionArgumentParams,
  createUpdateInstructionArgumentInstruction2,
  DeleteInstructionArgumentParams,
  Document,
  encodeFilters,
  getBulldozerError,
  InstructionArgument,
  InstructionArgumentFilters,
  INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
  UpdateInstructionArgumentParams,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaApiService } from '@heavy-duty/ngx-solana';
import { Keypair, PublicKey } from '@solana/web3.js';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionArgumentApiService {
  constructor(private readonly _ngxSolanaApiService: NgxSolanaApiService) {}

  // get instruction arguments
  find(filters: InstructionArgumentFilters) {
    return this._ngxSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), {
        filters: encodeFilters(INSTRUCTION_ARGUMENT_ACCOUNT_NAME, filters),
      })
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createInstructionArgumentDocument(new PublicKey(pubkey), account)
          )
        )
      );
  }

  // get instruction argument
  findById(
    instructionArgumentId: string
  ): Observable<Document<InstructionArgument> | null> {
    return this._ngxSolanaApiService
      .getAccountInfo(instructionArgumentId)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo &&
            createInstructionArgumentDocument(
              new PublicKey(instructionArgumentId),
              accountInfo
            )
        )
      );
  }

  // create instruction argument
  create(
    params: Omit<CreateInstructionArgumentParams, 'instructionArgumentId'>
  ) {
    const instructionArgumentKeypair = Keypair.generate();

    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) => {
        transaction.add(
          createCreateInstructionArgumentInstruction2({
            ...params,
            instructionArgumentId:
              instructionArgumentKeypair.publicKey.toBase58(),
          })
        );
        transaction.partialSign(instructionArgumentKeypair);
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

  // update instruction argument
  update(params: UpdateInstructionArgumentParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(createUpdateInstructionArgumentInstruction2(params))
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

  // delete instruction argument
  delete(params: DeleteInstructionArgumentParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(createDeleteInstructionArgumentInstruction2(params))
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
