import { Injectable } from '@angular/core';
import {
  Application,
  ApplicationFilters,
  applicationQueryBuilder,
  BULLDOZER_PROGRAM_ID,
  createApplication,
  createApplicationDocument,
  CreateApplicationParams,
  deleteApplication,
  DeleteApplicationParams,
  Document,
  getBulldozerError,
  updateApplication,
  UpdateApplicationParams,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaApiService } from '@heavy-duty/ngx-solana';
import { Keypair } from '@solana/web3.js';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApplicationApiService {
  constructor(private readonly _ngxSolanaApiService: NgxSolanaApiService) {}

  // get applications
  find(filters: ApplicationFilters) {
    const query = applicationQueryBuilder().where(filters).build();

    return this._ngxSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), query)
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createApplicationDocument(pubkey, account)
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
            accountInfo && createApplicationDocument(applicationId, accountInfo)
        )
      );
  }

  // create application
  create(params: Omit<CreateApplicationParams, 'applicationId'>) {
    const applicationKeypair = Keypair.generate();

    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) => {
        transaction.add(
          createApplication({
            ...params,
            applicationId: applicationKeypair.publicKey.toBase58(),
          })
        );
        transaction.partialSign(applicationKeypair);
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

  // update application
  update(params: UpdateApplicationParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(updateApplication(params))
      )
      .pipe(
        catchError((error) =>
          throwError(() =>
            typeof error === 'number' ? getBulldozerError(error) : error
          )
        )
      );
  }

  // delete application
  delete(params: DeleteApplicationParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(deleteApplication(params))
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
