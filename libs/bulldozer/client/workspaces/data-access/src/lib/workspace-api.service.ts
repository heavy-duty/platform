import { Injectable } from '@angular/core';
import { HdBroadcasterStore } from '@heavy-duty/broadcaster';
import {
  BULLDOZER_PROGRAM_ID,
  createWorkspace,
  createWorkspaceDocument,
  CreateWorkspaceParams,
  deleteWorkspace,
  DeleteWorkspaceParams,
  Document,
  parseBulldozerError,
  updateWorkspace,
  UpdateWorkspaceParams,
  Workspace,
  WorkspaceFilters,
  workspaceQueryBuilder,
} from '@heavy-duty/bulldozer-devkit';
import {
  HdSolanaApiService,
  HdSolanaConfigStore,
} from '@heavy-duty/ngx-solana';
import {
  addInstructionToTransaction,
  partiallySignTransaction,
} from '@heavy-duty/rx-solana';
import { Keypair } from '@solana/web3.js';
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
export class WorkspaceApiService {
  constructor(
    private readonly _hdSolanaApiService: HdSolanaApiService,
    private readonly _hdSolanaConfigStore: HdSolanaConfigStore,
    private readonly _hdBroadcasterStore: HdBroadcasterStore
  ) {}

  private handleError(error: string) {
    return throwError(() => parseBulldozerError(error) ?? null);
  }

  // get workspace ids
  findIds(filters: WorkspaceFilters) {
    const query = workspaceQueryBuilder().where(filters).build();

    return this._hdSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), {
        ...query,
        dataSlice: {
          length: 0,
          offset: 0,
        },
      })
      .pipe(
        map((programAccounts) => programAccounts.map(({ pubkey }) => pubkey))
      );
  }

  // get workspace
  findById(workspaceId: string): Observable<Document<Workspace> | null> {
    return this._hdSolanaApiService
      .getAccountInfo(workspaceId)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo && createWorkspaceDocument(workspaceId, accountInfo)
        )
      );
  }

  // get workspaces
  findByIds(
    workspaceIds: string[]
  ): Observable<(Document<Workspace> | null)[]> {
    return this._hdSolanaApiService
      .getMultipleAccounts(workspaceIds)
      .pipe(
        map((keyedAccounts) =>
          keyedAccounts.map(
            (keyedAccount) =>
              keyedAccount &&
              createWorkspaceDocument(
                keyedAccount.accountId,
                keyedAccount.accountInfo
              )
          )
        )
      );
  }

  // create workspace
  create(params: Omit<CreateWorkspaceParams, 'workspaceId'>) {
    const workspaceKeypair = Keypair.generate();

    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return createWorkspace(apiEndpoint, {
              ...params,
              workspaceId: workspaceKeypair.publicKey.toBase58(),
            });
          })
        )
      ),
      partiallySignTransaction(workspaceKeypair),
      concatMap((transaction) =>
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }

  // update workspace
  update(params: UpdateWorkspaceParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return updateWorkspace(apiEndpoint, params);
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

  // delete workspace
  delete(params: DeleteWorkspaceParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return deleteWorkspace(apiEndpoint, params);
          })
        )
      ),
      concatMap((transaction) =>
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }
}
