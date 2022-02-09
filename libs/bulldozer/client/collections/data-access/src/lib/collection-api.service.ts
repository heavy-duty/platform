import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  Collection,
  CollectionFilters,
  collectionQueryBuilder,
  createCollection,
  createCollectionDocument,
  CreateCollectionParams,
  deleteCollection,
  DeleteCollectionParams,
  Document,
  getBulldozerError,
  updateCollection,
  UpdateCollectionParams,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaApiService } from '@heavy-duty/ngx-solana';
import { Keypair } from '@solana/web3.js';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CollectionApiService {
  constructor(private readonly _ngxSolanaApiService: NgxSolanaApiService) {}

  // get collections
  find(filters: CollectionFilters) {
    const query = collectionQueryBuilder().where(filters).build();

    return this._ngxSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), query)
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createCollectionDocument(pubkey, account)
          )
        )
      );
  }

  // get collection
  findById(collectionId: string): Observable<Document<Collection> | null> {
    return this._ngxSolanaApiService
      .getAccountInfo(collectionId)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo && createCollectionDocument(collectionId, accountInfo)
        )
      );
  }

  // create collection
  create(params: Omit<CreateCollectionParams, 'collectionId'>) {
    const collectionKeypair = Keypair.generate();

    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) => {
        transaction.add(
          createCollection({
            ...params,
            collectionId: collectionKeypair.publicKey.toBase58(),
          })
        );
        transaction.partialSign(collectionKeypair);
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

  // update collection
  update(params: UpdateCollectionParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(updateCollection(params))
      )
      .pipe(
        catchError((error) =>
          throwError(() =>
            typeof error === 'number' ? getBulldozerError(error) : error
          )
        )
      );
  }

  // delete collection
  delete(params: DeleteCollectionParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(deleteCollection(params))
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
