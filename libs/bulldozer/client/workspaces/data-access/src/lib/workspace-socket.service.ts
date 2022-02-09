import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createWorkspaceDocument,
  Document,
  Workspace,
  WorkspaceFilters,
  workspaceQueryBuilder,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaSocketService } from '@heavy-duty/ngx-solana';
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
            ? createWorkspaceDocument(workspaceId, accountInfo)
            : null
        )
      );
  }

  workspaceCreated(filters: WorkspaceFilters) {
    const query = workspaceQueryBuilder()
      .where(filters)
      .setCommitment('finalized')
      .build();

    return this._ngxSolanaSocketService
      .onProgramAccountChange(BULLDOZER_PROGRAM_ID.toBase58(), query)
      .pipe(
        concatMap(({ account, pubkey }) => {
          if (account.lamports === 0) {
            return EMPTY;
          } else {
            const document = createWorkspaceDocument(pubkey, account);

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
