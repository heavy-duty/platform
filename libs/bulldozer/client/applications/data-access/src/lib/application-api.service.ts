import { Injectable } from '@angular/core';
import {
  Application,
  ApplicationFilters,
  APPLICATION_ACCOUNT_NAME,
  BULLDOZER_PROGRAM_ID,
  createApplicationDocument,
  CreateApplicationParams,
  createCreateApplicationInstruction2,
  createDeleteApplicationInstruction2,
  createUpdateApplicationInstruction2,
  DeleteApplicationParams,
  Document,
  encodeFilters,
  getBulldozerError,
  UpdateApplicationParams,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaApiService } from '@heavy-duty/ngx-solana';
import { Keypair, PublicKey } from '@solana/web3.js';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApplicationApiService {
  constructor(private readonly _ngxSolanaApiService: NgxSolanaApiService) {}

  // get applications
  find(filters: ApplicationFilters) {
    return this._ngxSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), {
        filters: encodeFilters(APPLICATION_ACCOUNT_NAME, filters),
      })
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createApplicationDocument(new PublicKey(pubkey), account)
          )
        )
      );
  }

  // get application
  findById(applicationId: string): Observable<Document<Application> | null> {
    return this._ngxSolanaApiService
      .getAccountInfo(applicationId)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo &&
            createApplicationDocument(new PublicKey(applicationId), accountInfo)
        )
      );
  }

  // create application
  create(params: Omit<CreateApplicationParams, 'applicationId'>) {
    const applicationKeypair = Keypair.generate();

    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) => {
        transaction.add(
          createCreateApplicationInstruction2({
            ...params,
            applicationId: applicationKeypair.publicKey.toBase58(),
          })
        );
        transaction.partialSign(applicationKeypair);
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

  // update application
  update(params: UpdateApplicationParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(createUpdateApplicationInstruction2(params))
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

  // delete application
  delete(params: DeleteApplicationParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(createDeleteApplicationInstruction2(params))
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
