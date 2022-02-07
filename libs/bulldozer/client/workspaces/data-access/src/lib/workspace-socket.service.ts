import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createWorkspaceDocument,
  Document,
  encodeFilters,
  Workspace,
  WorkspaceFilters,
  WORKSPACE_ACCOUNT_NAME,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaSocketService } from '@heavy-duty/ngx-solana';
import { PublicKey } from '@solana/web3.js';
import { concatMap, EMPTY, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WorkspaceSocketService {
  constructor(
    private readonly _ngxSolanaSocketService: NgxSolanaSocketService
  ) {}

  workspaceChanges(
    workspaceId: string
  ): Observable<Document<Workspace> | null> {
    return this._ngxSolanaSocketService
      .onAccountChange(workspaceId)
      .pipe(
        map((accountInfo) =>
          accountInfo.lamports > 0
            ? createWorkspaceDocument(new PublicKey(workspaceId), accountInfo)
            : null
        )
      );
  }

  workspaceCreated(filters: WorkspaceFilters) {
    return this._ngxSolanaSocketService
      .onProgramAccountChange(BULLDOZER_PROGRAM_ID.toBase58(), {
        filters: encodeFilters(WORKSPACE_ACCOUNT_NAME, filters),
        commitment: 'finalized',
      })
      .pipe(
        concatMap(({ account, pubkey }) => {
          if (account.lamports === 0) {
            return EMPTY;
          } else {
            const document = createWorkspaceDocument(
              new PublicKey(pubkey),
              account
            );

            if (document.createdAt.eq(document.updatedAt)) {
              return of(document);
            } else {
              return EMPTY;
            }
          }
        })
      );
  }
}
