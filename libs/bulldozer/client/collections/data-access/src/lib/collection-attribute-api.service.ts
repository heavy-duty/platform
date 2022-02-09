import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  CollectionAttribute,
  CollectionAttributeFilters,
  collectionAttributeQueryBuilder,
  createCollectionAttribute,
  createCollectionAttributeDocument,
  CreateCollectionAttributeParams,
  deleteCollectionAttribute,
  DeleteCollectionAttributeParams,
  Document,
  getBulldozerError,
  updateCollectionAttribute,
  UpdateCollectionAttributeParams,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaApiService } from '@heavy-duty/ngx-solana';
import { Keypair } from '@solana/web3.js';
import { catchError, map, Observable, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CollectionAttributeApiService {
  constructor(private readonly _ngxSolanaApiService: NgxSolanaApiService) {}

  // get collection attributes
  find(filters: CollectionAttributeFilters) {
    console.log(filters);
    const query = collectionAttributeQueryBuilder().where(filters).build();

    return this._ngxSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), query)
      .pipe(
        tap((a) => console.log(a)),
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createCollectionAttributeDocument(pubkey, account)
          )
        ),
        tap((a) => console.log(a))
      );
  }

  // get collection attribute
  findById(
    collectionAttributeId: string
  ): Observable<Document<CollectionAttribute> | null> {
    return this._ngxSolanaApiService
      .getAccountInfo(collectionAttributeId)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo &&
            createCollectionAttributeDocument(
              collectionAttributeId,
              accountInfo
            )
        )
      );
  }

  // create collection attribute
  create(
    params: Omit<CreateCollectionAttributeParams, 'collectionAttributeId'>
  ) {
    const collectionAttributeKeypair = Keypair.generate();

    console.log(params);

    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) => {
        transaction.add(
          createCollectionAttribute({
            ...params,
            collectionAttributeId:
              collectionAttributeKeypair.publicKey.toBase58(),
          })
        );
        transaction.partialSign(collectionAttributeKeypair);
        return transaction;
      })
      .pipe(
        catchError((error) =>
          throwError(() =>
            typeof error === 'number' ? getBulldozerError(error) : error
          )
        )
      );
  }

  // update collection attribute
  update(params: UpdateCollectionAttributeParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(updateCollectionAttribute(params))
      )
      .pipe(
        catchError((error) =>
          throwError(() =>
            typeof error === 'number' ? getBulldozerError(error) : error
          )
        )
      );
  }

  // delete collection attribute
  delete(params: DeleteCollectionAttributeParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(deleteCollectionAttribute(params))
      )
      .pipe(
        catchError((error) =>
          throwError(() =>
            typeof error === 'number' ? getBulldozerError(error) : error
          )
        )
      );
  }
}
