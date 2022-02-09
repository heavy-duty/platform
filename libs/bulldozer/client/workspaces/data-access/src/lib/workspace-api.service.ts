import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createWorkspace,
  createWorkspaceDocument,
  CreateWorkspaceParams,
  deleteWorkspace,
  DeleteWorkspaceParams,
  Document,
  getBulldozerError,
  updateWorkspace,
  UpdateWorkspaceParams,
  Workspace,
  WorkspaceFilters,
  workspaceQueryBuilder,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaApiService } from '@heavy-duty/ngx-solana';
import { Keypair } from '@solana/web3.js';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WorkspaceApiService {
  constructor(private readonly _ngxSolanaApiService: NgxSolanaApiService) {}

  // get workspaces
  find(filters: WorkspaceFilters) {
    const query = workspaceQueryBuilder().where(filters).build();

    return this._ngxSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), query)
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createWorkspaceDocument(pubkey, account)
          )
        )
      );
  }

  // get workspace
  findById(workspaceId: string): Observable<Document<Workspace> | null> {
    return this._ngxSolanaApiService
      .getAccountInfo(workspaceId)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo && createWorkspaceDocument(workspaceId, accountInfo)
        )
      );
  }

  // create workspace
  create(params: Omit<CreateWorkspaceParams, 'workspaceId'>) {
    const workspaceKeypair = Keypair.generate();

    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) => {
        transaction.add(
          createWorkspace({
            ...params,
            workspaceId: workspaceKeypair.publicKey.toBase58(),
          })
        );
        transaction.partialSign(workspaceKeypair);
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

  // update workspace
  update(params: UpdateWorkspaceParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(updateWorkspace(params))
      )
      .pipe(
        catchError((error) =>
          throwError(() =>
            typeof error === 'number' ? getBulldozerError(error) : error
          )
        )
      );
  }

  // delete workspace
  delete(params: DeleteWorkspaceParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(deleteWorkspace(params))
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
