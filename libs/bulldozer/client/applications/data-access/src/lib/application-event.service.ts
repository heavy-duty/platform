import { Injectable } from '@angular/core';
import {
  Application,
  ApplicationFilters,
  applicationQueryBuilder,
  BULLDOZER_PROGRAM_ID,
  createApplicationDocument,
  Document,
} from '@heavy-duty/bulldozer-devkit';
import { HdSolanaConnectionStore } from '@heavy-duty/ngx-solana';
import { concatMap, EMPTY, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApplicationEventService {
  constructor(
    private readonly _hdSolanaConnectionStore: HdSolanaConnectionStore
  ) {}

  applicationChanges(
    applicationId: string
  ): Observable<Document<Application> | null> {
    return this._hdSolanaConnectionStore
      .onAccountChange(applicationId)
      .pipe(
        map((accountInfo) =>
          accountInfo.lamports > 0
            ? createApplicationDocument(applicationId, accountInfo)
            : null
        )
      );
  }

  applicationCreated(filters: ApplicationFilters) {
    const query = applicationQueryBuilder()
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
            const document = createApplicationDocument(pubkey, account);

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
