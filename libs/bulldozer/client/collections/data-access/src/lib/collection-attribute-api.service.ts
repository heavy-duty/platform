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
import {
  HdSolanaApiService,
  HdSolanaConfigStore,
} from '@heavy-duty/ngx-solana';
import {
  addInstructionToTransaction,
  partiallySignTransaction,
} from '@heavy-duty/rx-solana';
import { Keypair } from '@solana/web3.js';
import {
  catchError,
  concatMap,
  first,
  map,
  Observable,
  throwError,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CollectionAttributeApiService {
  constructor(
    private readonly _hdSolanaApiService: HdSolanaApiService,
    private readonly _hdSolanaConfigStore: HdSolanaConfigStore
  ) {}

  private handleError(error: unknown) {
    return throwError(() =>
      typeof error === 'number' ? getBulldozerError(error) : error
    );
  }

  // get collection attributes
  find(filters: CollectionAttributeFilters) {
    const query = collectionAttributeQueryBuilder().where(filters).build();

    return this._hdSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), query)
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createCollectionAttributeDocument(pubkey, account)
          )
        )
      );
  }

  // get collection attribute
  findById(
    collectionAttributeId: string
  ): Observable<Document<CollectionAttribute> | null> {
    return this._hdSolanaApiService
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

    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return createCollectionAttribute(apiEndpoint, {
              ...params,
              collectionAttributeId:
                collectionAttributeKeypair.publicKey.toBase58(),
            });
          })
        )
      ),
      partiallySignTransaction(collectionAttributeKeypair),
      concatMap((transaction) =>
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }

  // update collection attribute
  update(params: UpdateCollectionAttributeParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return updateCollectionAttribute(apiEndpoint, params);
          })
        )
      ),
      concatMap((transaction) =>
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }

  // delete collection attribute
  delete(params: DeleteCollectionAttributeParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return deleteCollectionAttribute(apiEndpoint, params);
          })
        )
      ),
      concatMap((transaction) =>
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }
}
