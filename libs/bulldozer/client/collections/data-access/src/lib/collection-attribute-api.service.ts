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
  parseBulldozerError,
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
import {
  Finality,
  Keypair,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js';
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

  private handleError(error: string) {
    return throwError(() => parseBulldozerError(error) ?? null);
  }

  // get collection attribute ids
  findIds(
    filters: CollectionAttributeFilters,
    commitment: Finality = 'finalized'
  ) {
    const query = collectionAttributeQueryBuilder().where(filters).build();

    return this._hdSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), {
        ...query,
        dataSlice: {
          offset: 0,
          length: 0,
        },
        commitment,
      })
      .pipe(
        map((programAccounts) => programAccounts.map(({ pubkey }) => pubkey))
      );
  }

  // get collection attribute
  findById(
    collectionAttributeId: string,
    commitment: Finality = 'finalized'
  ): Observable<Document<CollectionAttribute> | null> {
    return this._hdSolanaApiService
      .getAccountInfo(collectionAttributeId, commitment)
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

  // get collection attributes
  findByIds(
    collectionAttributeIds: string[],
    commitment: Finality = 'finalized'
  ) {
    return this._hdSolanaApiService
      .getMultipleAccounts(collectionAttributeIds, { commitment })
      .pipe(
        map((keyedAccounts) =>
          keyedAccounts.map(
            (keyedAccount) =>
              keyedAccount &&
              createCollectionAttributeDocument(
                keyedAccount.accountId,
                keyedAccount.accountInfo
              )
          )
        )
      );
  }

  // create collection attribute
  create(
    collectionAttributeKeypair: Keypair,
    params: Omit<CreateCollectionAttributeParams, 'collectionAttributeId'>
  ): Observable<{
    transactionSignature: TransactionSignature;
    transaction: Transaction;
  }> {
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

  // update collection attribute
  update(params: UpdateCollectionAttributeParams): Observable<{
    transactionSignature: TransactionSignature;
    transaction: Transaction;
  }> {
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

  // delete collection attribute
  delete(params: DeleteCollectionAttributeParams): Observable<{
    transactionSignature: TransactionSignature;
    transaction: Transaction;
  }> {
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
