import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  CollectionAttribute,
  CollectionAttributeFilters,
  collectionAttributeQueryBuilder,
  createCollectionAttributeDocument,
  Document,
} from '@heavy-duty/bulldozer-devkit';
import { HdSolanaConnectionStore } from '@heavy-duty/ngx-solana';
import { concatMap, EMPTY, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CollectionAttributeEventService {
  constructor(
    private readonly _hdSolanaConnectionStore: HdSolanaConnectionStore
  ) {}

  collectionAttributeChanges(
    collectionAttributeId: string
  ): Observable<Document<CollectionAttribute> | null> {
    return this._hdSolanaConnectionStore
      .onAccountChange(collectionAttributeId)
      .pipe(
        map((accountInfo) =>
          accountInfo.lamports > 0
            ? createCollectionAttributeDocument(
                collectionAttributeId,
                accountInfo
              )
            : null
        )
      );
  }

  collectionAttributeCreated(filters: CollectionAttributeFilters) {
    const query = collectionAttributeQueryBuilder()
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
            const document = createCollectionAttributeDocument(pubkey, account);

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
