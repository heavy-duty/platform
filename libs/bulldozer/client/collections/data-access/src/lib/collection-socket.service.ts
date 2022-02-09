import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  Collection,
  CollectionFilters,
  collectionQueryBuilder,
  createCollectionDocument,
  Document,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaSocketService } from '@heavy-duty/ngx-solana';
import { concatMap, EMPTY, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CollectionSocketService {
  constructor(
    private readonly _ngxSolanaSocketService: NgxSolanaSocketService
  ) {}

  collectionChanges(
    collectionId: string
  ): Observable<Document<Collection> | null> {
    return this._ngxSolanaSocketService
      .onAccountChange(collectionId)
      .pipe(
        map((accountInfo) =>
          accountInfo.lamports > 0
            ? createCollectionDocument(collectionId, accountInfo)
            : null
        )
      );
  }

  collectionCreated(filters: CollectionFilters) {
    const query = collectionQueryBuilder()
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
            const document = createCollectionDocument(pubkey, account);

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
