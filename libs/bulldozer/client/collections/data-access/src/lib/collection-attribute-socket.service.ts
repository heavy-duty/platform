import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  CollectionAttribute,
  CollectionAttributeFilters,
  COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
  createCollectionAttributeDocument,
  Document,
  encodeFilters,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaSocketService } from '@heavy-duty/ngx-solana';
import { PublicKey } from '@solana/web3.js';
import { concatMap, EMPTY, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CollectionAttributeSocketService {
  constructor(
    private readonly _ngxSolanaSocketService: NgxSolanaSocketService
  ) {}

  collectionAttributeChanges(
    collectionAttributeId: string
  ): Observable<Document<CollectionAttribute> | null> {
    return this._ngxSolanaSocketService
      .onAccountChange(collectionAttributeId)
      .pipe(
        map((accountInfo) =>
          accountInfo.lamports > 0
            ? createCollectionAttributeDocument(
                new PublicKey(collectionAttributeId),
                accountInfo
              )
            : null
        )
      );
  }

  collectionAttributeCreated(filters: CollectionAttributeFilters) {
    return this._ngxSolanaSocketService
      .onProgramAccountChange(BULLDOZER_PROGRAM_ID.toBase58(), {
        filters: encodeFilters(COLLECTION_ATTRIBUTE_ACCOUNT_NAME, filters),
        commitment: 'finalized',
      })
      .pipe(
        concatMap(({ account, pubkey }) => {
          if (account.lamports === 0) {
            return EMPTY;
          } else {
            const document = createCollectionAttributeDocument(
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
