import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  Collaborator,
  CollaboratorFilters,
  collaboratorQueryBuilder,
  createCollaboratorDocument,
  Document,
} from '@heavy-duty/bulldozer-devkit';
import { HdSolanaConnectionStore } from '@heavy-duty/ngx-solana';
import { concatMap, EMPTY, filter, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CollaboratorEventService {
  constructor(
    private readonly _hdSolanaConnectionStore: HdSolanaConnectionStore
  ) {}

  collaboratorChanges(
    collaboratorId: string
  ): Observable<Document<Collaborator> | null> {
    return this._hdSolanaConnectionStore
      .onAccountChange(collaboratorId)
      .pipe(
        map((accountInfo) =>
          accountInfo.lamports > 0
            ? createCollaboratorDocument(collaboratorId, accountInfo)
            : null
        )
      );
  }

  collaboratorDeleted(collaboratorId: string): Observable<unknown> {
    return this._hdSolanaConnectionStore
      .onAccountChange(collaboratorId, 'finalized')
      .pipe(filter((accountInfo) => accountInfo.lamports === 0));
  }

  collaboratorCreated(filters: CollaboratorFilters) {
    const query = collaboratorQueryBuilder()
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
            const document = createCollaboratorDocument(pubkey, account);

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
