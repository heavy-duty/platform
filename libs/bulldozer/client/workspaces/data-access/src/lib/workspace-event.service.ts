import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createWorkspaceDocument,
  Document,
  Workspace,
  WorkspaceFilters,
  workspaceQueryBuilder,
} from '@heavy-duty/bulldozer-devkit';
import { HdSolanaConnectionStore } from '@heavy-duty/ngx-solana';
import { concatMap, EMPTY, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WorkspaceEventService {
  constructor(
    private readonly _hdSolanaConnectionStore: HdSolanaConnectionStore
  ) {}

  workspaceChanges(
    workspaceId: string
  ): Observable<Document<Workspace> | null> {
    return this._hdSolanaConnectionStore
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

    return this._hdSolanaConnectionStore
      .onProgramAccountChange(BULLDOZER_PROGRAM_ID.toBase58(), query)
      .pipe(
        concatMap(({ account, pubkey }) => {
          if (account.lamports === 0) {
            return EMPTY;
          } else {
            const document = createWorkspaceDocument(pubkey, account);

            if (
              document.updatedAt !== undefined &&
              document.createdAt.eq(document.updatedAt)
            ) {
              return of(document);
            } else {
              return EMPTY;
            }
          }
        })
      );
  }
}
