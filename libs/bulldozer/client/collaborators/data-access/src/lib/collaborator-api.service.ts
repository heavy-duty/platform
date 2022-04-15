import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  Collaborator,
  CollaboratorFilters,
  collaboratorQueryBuilder,
  createCollaborator,
  createCollaboratorDocument,
  CreateCollaboratorParams,
  deleteCollaborator,
  DeleteCollaboratorParams,
  Document,
  parseBulldozerError,
  requestCollaboratorStatus,
  RequestCollaboratorStatusParams,
  retryCollaboratorStatusRequest,
  RetryCollaboratorStatusRequestParams,
  updateCollaborator,
  UpdateCollaboratorParams,
} from '@heavy-duty/bulldozer-devkit';
import {
  HdSolanaApiService,
  HdSolanaConfigStore,
} from '@heavy-duty/ngx-solana';
import { addInstructionToTransaction } from '@heavy-duty/rx-solana';
import { Finality } from '@solana/web3.js';
import {
  catchError,
  concatMap,
  first,
  map,
  Observable,
  throwError,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CollaboratorApiService {
  constructor(
    private readonly _hdSolanaApiService: HdSolanaApiService,
    private readonly _hdSolanaConfigStore: HdSolanaConfigStore
  ) {}

  private handleError(error: string) {
    return throwError(() => parseBulldozerError(error) ?? null);
  }

  // get collaborator ids
  findIds(filters: CollaboratorFilters, commitment: Finality = 'finalized') {
    const query = collaboratorQueryBuilder().where(filters).build();

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

  // get collaborator
  findById(
    collaboratorId: string,
    commitment: Finality = 'finalized'
  ): Observable<Document<Collaborator> | null> {
    return this._hdSolanaApiService
      .getAccountInfo(collaboratorId, commitment)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo &&
            createCollaboratorDocument(collaboratorId, accountInfo)
        )
      );
  }

  // get collaborators
  findByIds(
    applicationIds: string[],
    commitment: Finality = 'finalized'
  ): Observable<(Document<Collaborator> | null)[]> {
    return this._hdSolanaApiService
      .getMultipleAccounts(applicationIds, { commitment })
      .pipe(
        map((keyedAccounts) =>
          keyedAccounts.map(
            (keyedAccount) =>
              keyedAccount &&
              createCollaboratorDocument(
                keyedAccount.accountId,
                keyedAccount.accountInfo
              )
          )
        )
      );
  }

  // create collaborator
  create(params: CreateCollaboratorParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return createCollaborator(apiEndpoint, params);
          })
        )
      ),
      concatMap((transaction) =>
        this._hdSolanaApiService.sendTransaction(transaction).pipe(
          map((transactionSignature) => ({
            transactionSignature,
            transaction,
          })),
          catchError((error) => this.handleError(error))
        )
      )
    );
  }

  // update workspace
  update(params: UpdateCollaboratorParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return updateCollaborator(apiEndpoint, params);
          })
        )
      ),
      concatMap((transaction) =>
        this._hdSolanaApiService.sendTransaction(transaction).pipe(
          map((transactionSignature) => ({
            transactionSignature,
            transaction,
          })),
          catchError((error) => this.handleError(error))
        )
      )
    );
  }

  // delete collaborator
  delete(params: DeleteCollaboratorParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return deleteCollaborator(apiEndpoint, params);
          })
        )
      ),
      concatMap((transaction) =>
        this._hdSolanaApiService.sendTransaction(transaction).pipe(
          map((transactionSignature) => ({
            transactionSignature,
            transaction,
          })),
          catchError((error) => this.handleError(error))
        )
      )
    );
  }

  // request collaborator status
  requestCollaboratorStatus(params: RequestCollaboratorStatusParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return requestCollaboratorStatus(apiEndpoint, params);
          })
        )
      ),
      concatMap((transaction) =>
        this._hdSolanaApiService.sendTransaction(transaction).pipe(
          map((transactionSignature) => ({
            transactionSignature,
            transaction,
          })),
          catchError((error) => this.handleError(error))
        )
      )
    );
  }

  // retry collaborator status request
  retryCollaboratorStatusRequest(params: RetryCollaboratorStatusRequestParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return retryCollaboratorStatusRequest(apiEndpoint, params);
          })
        )
      ),
      concatMap((transaction) =>
        this._hdSolanaApiService.sendTransaction(transaction).pipe(
          map((transactionSignature) => ({
            transactionSignature,
            transaction,
          })),
          catchError((error) => this.handleError(error))
        )
      )
    );
  }
}
