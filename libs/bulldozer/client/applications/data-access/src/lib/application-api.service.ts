import { Injectable } from '@angular/core';
import { HdBroadcasterStore } from '@heavy-duty/broadcaster';
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
  parseBulldozerError,
  updateApplication,
  UpdateApplicationParams,
} from '@heavy-duty/bulldozer-devkit';
import {
  HdSolanaApiService,
  HdSolanaConfigStore,
} from '@heavy-duty/ngx-solana';
import {
  addInstructionToTransaction,
  partiallySignTransaction,
} from '@heavy-duty/rx-solana';
import { Finality, Keypair } from '@solana/web3.js';
import {
  catchError,
  concatMap,
  first,
  map,
  Observable,
  tap,
  throwError,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApplicationApiService {
  constructor(
    private readonly _hdSolanaApiService: HdSolanaApiService,
    private readonly _hdSolanaConfigStore: HdSolanaConfigStore,
    private readonly _hdBroadcasterStore: HdBroadcasterStore
  ) {}

  private handleError(error: string) {
    return throwError(() => parseBulldozerError(error) ?? null);
  }

  // get application ids
  findIds(filters: ApplicationFilters, commitment: Finality = 'finalized') {
    const query = applicationQueryBuilder().where(filters).build();

    return this._hdSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), {
        ...query,
        commitment,
        dataSlice: {
          offset: 0,
          length: 0,
        },
      })
      .pipe(
        map((programAccounts) => programAccounts.map(({ pubkey }) => pubkey))
      );
  }

  // get application
  findById(
    applicationId: string,
    commitment: Finality = 'finalized'
  ): Observable<Document<Application> | null> {
    return this._hdSolanaApiService
      .getAccountInfo(applicationId, commitment)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo && createApplicationDocument(applicationId, accountInfo)
        )
      );
  }

  // get applications
  findByIds(
    applicationIds: string[],
    commitment: Finality = 'finalized'
  ): Observable<(Document<Application> | null)[]> {
    return this._hdSolanaApiService
      .getMultipleAccounts(applicationIds, { commitment })
      .pipe(
        map((keyedAccounts) =>
          keyedAccounts.map(
            (keyedAccount) =>
              keyedAccount &&
              createApplicationDocument(
                keyedAccount.accountId,
                keyedAccount.accountInfo
              )
          )
        )
      );
  }

  // create application
  create(params: Omit<CreateApplicationParams, 'applicationId'>) {
    const applicationKeypair = Keypair.generate();

    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return createApplication(apiEndpoint, {
              ...params,
              applicationId: applicationKeypair.publicKey.toBase58(),
            });
          })
        )
      ),
      partiallySignTransaction(applicationKeypair),
      concatMap((transaction) =>
        this._hdSolanaApiService.sendTransaction(transaction).pipe(
          tap((transactionSignature) =>
            this._hdBroadcasterStore.sendTransaction(
              transactionSignature,
              params.workspaceId
            )
          ),
          catchError((error) => this.handleError(error))
        )
      )
    );
  }

  // update application
  update(params: UpdateApplicationParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return updateApplication(apiEndpoint, params);
          })
        )
      ),
      concatMap((transaction) =>
        this._hdSolanaApiService.sendTransaction(transaction).pipe(
          tap((transactionSignature) =>
            this._hdBroadcasterStore.sendTransaction(
              transactionSignature,
              params.workspaceId
            )
          ),
          catchError((error) => this.handleError(error))
        )
      )
    );
  }

  // delete application
  delete(params: DeleteApplicationParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return deleteApplication(apiEndpoint, params);
          })
        )
      ),
      concatMap((transaction) =>
        this._hdSolanaApiService.sendTransaction(transaction).pipe(
          tap((transactionSignature) =>
            this._hdBroadcasterStore.sendTransaction(
              transactionSignature,
              params.workspaceId
            )
          ),
          catchError((error) => this.handleError(error))
        )
      )
    );
  }
}
