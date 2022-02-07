import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createCreateWorkspaceInstruction2,
  createDeleteWorkspaceInstruction2,
  createUpdateWorkspaceInstruction2,
  createWorkspaceDocument,
  CreateWorkspaceParams,
  DeleteWorkspaceParams,
  Document,
  encodeFilters,
  UpdateWorkspaceParams,
  Workspace,
  WorkspaceFilters,
  WORKSPACE_ACCOUNT_NAME,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaApiService } from '@heavy-duty/ngx-solana';
import { Keypair, PublicKey } from '@solana/web3.js';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WorkspaceApiService {
  constructor(private readonly _ngxSolanaApiService: NgxSolanaApiService) {}

  // get workspaces
  find(filters: WorkspaceFilters) {
    return this._ngxSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), {
        filters: encodeFilters(WORKSPACE_ACCOUNT_NAME, filters),
      })
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createWorkspaceDocument(new PublicKey(pubkey), account)
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
            accountInfo &&
            createWorkspaceDocument(new PublicKey(workspaceId), accountInfo)
        )
      );
  }

  // create workspace
  create(params: Omit<CreateWorkspaceParams, 'workspaceId'>) {
    const workspaceKeypair = Keypair.generate();

    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) => {
        transaction.add(
          createCreateWorkspaceInstruction2({
            ...params,
            workspaceId: workspaceKeypair.publicKey.toBase58(),
          })
        );
        transaction.partialSign(workspaceKeypair);
        return transaction;
      }
    );
  }

  // update workspace
  update(params: UpdateWorkspaceParams) {
    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) =>
        transaction.add(createUpdateWorkspaceInstruction2(params))
    );
  }

  // delete workspace
  delete(params: DeleteWorkspaceParams) {
    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) =>
        transaction.add(createDeleteWorkspaceInstruction2(params))
    );
  }
}
