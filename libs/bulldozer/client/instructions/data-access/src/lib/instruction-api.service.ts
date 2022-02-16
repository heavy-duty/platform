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
import { HdSolanaApiService } from '@heavy-duty/ngx-solana';
import {
  addInstructionToTransaction,
  partiallySignTransaction,
} from '@heavy-duty/rx-solana';
import { Keypair } from '@solana/web3.js';
import { catchError, concatMap, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionApiService {
  constructor(private readonly _hdSolanaApiService: HdSolanaApiService) {}

  private handleError(error: unknown) {
    return throwError(() =>
      typeof error === 'number' ? getBulldozerError(error) : error
    );
  }

  // get instructions
  find(filters: InstructionFilters) {
    const query = instructionQueryBuilder().where(filters).build();

    return this._hdSolanaApiService
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
    return this._hdSolanaApiService
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

    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        createInstruction({
          ...params,
          instructionId: instructionKeypair.publicKey.toBase58(),
        })
      ),
      partiallySignTransaction(instructionKeypair),
      concatMap((transaction) =>
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }

  // update instruction
  update(params: UpdateInstructionParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(updateInstruction(params)),
      concatMap((transaction) =>
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }

  // update instruction body
  updateBody(params: UpdateInstructionBodyParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(updateInstructionBody(params)),
      concatMap((transaction) =>
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }

  // delete instruction
  delete(params: DeleteInstructionParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(deleteInstruction(params)),
      concatMap((transaction) =>
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }
}
