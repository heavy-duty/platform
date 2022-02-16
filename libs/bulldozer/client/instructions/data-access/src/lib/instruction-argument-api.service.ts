import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createInstructionArgument,
  createInstructionArgumentDocument,
  CreateInstructionArgumentParams,
  deleteInstructionArgument,
  DeleteInstructionArgumentParams,
  Document,
  getBulldozerError,
  InstructionArgument,
  InstructionArgumentFilters,
  instructionArgumentQueryBuilder,
  updateInstructionArgument,
  UpdateInstructionArgumentParams,
} from '@heavy-duty/bulldozer-devkit';
import { HdSolanaApiService } from '@heavy-duty/ngx-solana';
import {
  addInstructionToTransaction,
  partiallySignTransaction,
} from '@heavy-duty/rx-solana';
import { Keypair } from '@solana/web3.js';
import { catchError, concatMap, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionArgumentApiService {
  constructor(private readonly _hdSolanaApiService: HdSolanaApiService) {}

  private handleError(error: unknown) {
    return throwError(() =>
      typeof error === 'number' ? getBulldozerError(error) : error
    );
  }

  // get instruction arguments
  find(filters: InstructionArgumentFilters) {
    const query = instructionArgumentQueryBuilder().where(filters).build();

    return this._hdSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), query)
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createInstructionArgumentDocument(pubkey, account)
          )
        )
      );
  }

  // get instruction argument
  findById(
    instructionArgumentId: string
  ): Observable<Document<InstructionArgument> | null> {
    return this._hdSolanaApiService
      .getAccountInfo(instructionArgumentId)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo &&
            createInstructionArgumentDocument(
              instructionArgumentId,
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

    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        createInstructionArgument({
          ...params,
          instructionArgumentId:
            instructionArgumentKeypair.publicKey.toBase58(),
        })
      ),
      partiallySignTransaction(instructionArgumentKeypair),
      concatMap((transaction) =>
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }

  // update instruction argument
  update(params: UpdateInstructionArgumentParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(updateInstructionArgument(params)),
      concatMap((transaction) =>
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }

  // delete instruction argument
  delete(params: DeleteInstructionArgumentParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(deleteInstructionArgument(params)),
      concatMap((transaction) =>
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }
}
