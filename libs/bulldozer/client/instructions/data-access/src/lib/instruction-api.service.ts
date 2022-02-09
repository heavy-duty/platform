import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createInstruction,
  createInstructionDocument,
  CreateInstructionParams,
  deleteInstruction,
  DeleteInstructionParams,
  Document,
  getBulldozerError,
  Instruction,
  InstructionFilters,
  instructionQueryBuilder,
  updateInstruction,
  updateInstructionBody,
  UpdateInstructionBodyParams,
  UpdateInstructionParams,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaApiService } from '@heavy-duty/ngx-solana';
import { Keypair } from '@solana/web3.js';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionApiService {
  constructor(private readonly _ngxSolanaApiService: NgxSolanaApiService) {}

  // get instructions
  find(filters: InstructionFilters) {
    const query = instructionQueryBuilder().where(filters).build();

    return this._ngxSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), query)
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createInstructionDocument(pubkey, account)
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
            accountInfo && createInstructionDocument(instructionId, accountInfo)
        )
      );
  }

  // create instruction
  create(params: Omit<CreateInstructionParams, 'instructionId'>) {
    const instructionKeypair = Keypair.generate();

    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) => {
        transaction.add(
          createInstruction({
            ...params,
            instructionId: instructionKeypair.publicKey.toBase58(),
          })
        );
        transaction.partialSign(instructionKeypair);
        return transaction;
      })
      .pipe(
        catchError((error) =>
          throwError(() =>
            typeof error === 'number' ? getBulldozerError(error) : error
          )
        )
      );
  }

  // update instruction
  update(params: UpdateInstructionParams) {
    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) => transaction.add(updateInstruction(params))
    );
  }

  // update instruction body
  updateBody(params: UpdateInstructionBodyParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(updateInstructionBody(params))
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
  delete(params: DeleteInstructionParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(deleteInstruction(params))
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
