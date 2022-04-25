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
  parseBulldozerError,
  updateCollection,
  UpdateCollectionParams,
} from '@heavy-duty/bulldozer-devkit';
import {
  HdSolanaApiService,
  HdSolanaConfigStore,
} from '@heavy-duty/ngx-solana';
import {
  addInstructionToTransaction,
  partiallySignTransaction,
} from '@heavy-duty/rx-solana';
import { Finality, Keypair } from '@solana/web3.js';
import {
  catchError,
  concatMap,
  first,
  map,
  Observable,
  throwError,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CollectionApiService {
  constructor(
    private readonly _hdSolanaApiService: HdSolanaApiService,
    private readonly _hdSolanaConfigStore: HdSolanaConfigStore
  ) {}

  private handleError(error: string) {
    return throwError(() => parseBulldozerError(error) ?? null);
  }

  // get collection ids
  findIds(filters: CollectionFilters, commitment: Finality = 'finalized') {
    const query = collectionQueryBuilder().where(filters).build();

    return this._hdSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), {
        ...query,
        commitment,
        dataSlice: {
          offset: 0,
          length: 0,
        },
      })
      .pipe(
        map((programAccounts) => programAccounts.map(({ pubkey }) => pubkey))
      );
  }

  // get collection
  findById(
    collectionId: string,
    commitment: Finality = 'finalized'
  ): Observable<Document<Collection> | null> {
    return this._hdSolanaApiService
      .getAccountInfo(collectionId, commitment)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo && createCollectionDocument(collectionId, accountInfo)
        )
      );
  }

  // get collections
  findByIds(
    collectionIds: string[],
    commitment: Finality = 'finalized'
  ): Observable<(Document<Collection> | null)[]> {
    return this._hdSolanaApiService
      .getMultipleAccounts(collectionIds, { commitment })
      .pipe(
        map((keyedAccounts) =>
          keyedAccounts.map(
            (keyedAccount) =>
              keyedAccount &&
              createCollectionDocument(
                keyedAccount.accountId,
                keyedAccount.accountInfo
              )
          )
        )
      );
  }

  // create collection
  create(
    collectionKeypair: Keypair,
    params: Omit<CreateCollectionParams, 'collectionId'>
  ) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return createCollection(apiEndpoint, {
              ...params,
              collectionId: collectionKeypair.publicKey.toBase58(),
            });
          })
        )
      ),
      partiallySignTransaction(collectionKeypair),
      concatMap((transaction) =>
        this._hdSolanaApiService.sendTransaction(transaction).pipe(
          map((transactionSignature) => ({
            transactionSignature,
            transaction,
          })),
          catchError((error) => this.handleError(error))
        )
      )
    );
  }

  // update collection
  update(params: UpdateCollectionParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return updateCollection(apiEndpoint, params);
          })
        )
      ),
      concatMap((transaction) =>
        this._hdSolanaApiService.sendTransaction(transaction).pipe(
          map((transactionSignature) => ({
            transactionSignature,
            transaction,
          })),
          catchError((error) => this.handleError(error))
        )
      )
    );
  }

  // delete collection
  delete(params: DeleteCollectionParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return deleteCollection(apiEndpoint, params);
          })
        )
      ),
      concatMap((transaction) =>
        this._hdSolanaApiService.sendTransaction(transaction).pipe(
          map((transactionSignature) => ({
            transactionSignature,
            transaction,
          })),
          catchError((error) => this.handleError(error))
        )
      )
    );
  }
}
