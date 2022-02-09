import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createInstructionAccount,
  createInstructionAccountDocument,
  CreateInstructionAccountParams,
  deleteInstructionAccount,
  DeleteInstructionAccountParams,
  Document,
  getBulldozerError,
  InstructionAccount,
  InstructionAccountFilters,
  instructionAccountQueryBuilder,
  updateInstructionAccount,
  UpdateInstructionAccountParams,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaApiService } from '@heavy-duty/ngx-solana';
import { Keypair } from '@solana/web3.js';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionAccountApiService {
  constructor(private readonly _ngxSolanaApiService: NgxSolanaApiService) {}

  // get instruction accounts
  find(filters: InstructionAccountFilters) {
    const query = instructionAccountQueryBuilder().where(filters).build();

    return this._ngxSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), query)
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createInstructionAccountDocument(pubkey, account)
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
            createInstructionAccountDocument(instructionAccountId, accountInfo)
        )
      );
  }

  // create instruction account
  create(params: Omit<CreateInstructionAccountParams, 'instructionAccountId'>) {
    const instructionAccountKeypair = Keypair.generate();

    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) => {
        transaction.add(
          createInstructionAccount({
            ...params,
            instructionAccountId:
              instructionAccountKeypair.publicKey.toBase58(),
          })
        );
        transaction.partialSign(instructionAccountKeypair);
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

  // update instruction account
  update(params: UpdateInstructionAccountParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(updateInstructionAccount(params))
      )
      .pipe(
        catchError((error) =>
          throwError(() =>
            typeof error === 'number' ? getBulldozerError(error) : error
          )
        )
      );
  }

  // delete instruction account
  delete(params: DeleteInstructionAccountParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(deleteInstructionAccount(params))
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
