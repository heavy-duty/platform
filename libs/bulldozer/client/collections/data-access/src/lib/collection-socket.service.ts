import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  Collection,
  CollectionFilters,
  COLLECTION_ACCOUNT_NAME,
  createCollectionDocument,
  Document,
  encodeFilters,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaSocketService } from '@heavy-duty/ngx-solana';
import { PublicKey } from '@solana/web3.js';
import { concatMap, EMPTY, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CollectionSocketService {
  constructor(
    private readonly _ngxSolanaSocketService: NgxSolanaSocketService
  ) {}

  collectionChanges(
    collectionPublicKey: string
  ): Observable<Document<Collection> | null> {
    return this._ngxSolanaSocketService
      .onAccountChange(collectionPublicKey)
      .pipe(
        map((accountInfo) =>
          accountInfo.lamports > 0
            ? createCollectionDocument(
                new PublicKey(collectionPublicKey),
                accountInfo
              )
            : null
        )
      );
  }

  collectionCreated(filters: CollectionFilters) {
    return this._ngxSolanaSocketService
      .onProgramAccountChange(BULLDOZER_PROGRAM_ID.toBase58(), {
        filters: encodeFilters(COLLECTION_ACCOUNT_NAME, filters),
        commitment: 'finalized',
      })
      .pipe(
        concatMap(({ account, pubkey }) => {
          if (account.lamports === 0) {
            return EMPTY;
          } else {
            const document = createCollectionDocument(
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
