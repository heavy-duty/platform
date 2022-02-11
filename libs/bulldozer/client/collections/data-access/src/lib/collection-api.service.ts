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
import {
  addInstructionToTransaction,
  partiallySignTransaction,
} from '@heavy-duty/rx-solana';
import { Keypair } from '@solana/web3.js';
import { catchError, concatMap, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CollectionApiService {
  constructor(private readonly _ngxSolanaApiService: NgxSolanaApiService) {}

  private handleError(error: unknown) {
    return throwError(() =>
      typeof error === 'number' ? getBulldozerError(error) : error
    );
  }

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

    return this._ngxSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        createCollection({
          ...params,
          collectionId: collectionKeypair.publicKey.toBase58(),
        })
      ),
      partiallySignTransaction(collectionKeypair),
      concatMap((transaction) =>
        this._ngxSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }

  // update collection
  update(params: UpdateCollectionParams) {
    return this._ngxSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(updateCollection(params)),
      concatMap((transaction) =>
        this._ngxSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }

  // delete collection
  delete(params: DeleteCollectionParams) {
    return this._ngxSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(deleteCollection(params)),
      concatMap((transaction) =>
        this._ngxSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }
}
