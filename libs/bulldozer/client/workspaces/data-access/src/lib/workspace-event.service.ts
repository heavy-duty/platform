import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createWorkspaceDocument,
  Document,
  Workspace,
  WorkspaceFilters,
  workspaceQueryBuilder,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaConnectionStore } from '@heavy-duty/ngx-solana';
import { concatMap, EMPTY, map, Observable, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WorkspaceEventService {
  constructor(private readonly _connectionStore: NgxSolanaConnectionStore) {}

  workspaceChanges(
    workspaceId: string
  ): Observable<Document<Workspace> | null> {
    console.log(workspaceId);
    return this._connectionStore.onAccountChange(workspaceId).pipe(
      tap((a) => console.log(a)),
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

    return this._connectionStore
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
