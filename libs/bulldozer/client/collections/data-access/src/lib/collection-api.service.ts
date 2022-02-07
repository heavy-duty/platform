import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  Collection,
  CollectionFilters,
  COLLECTION_ACCOUNT_NAME,
  createCollectionDocument,
  CreateCollectionParams,
  createCreateCollectionInstruction2,
  createDeleteCollectionInstruction2,
  createUpdateCollectionInstruction2,
  DeleteCollectionParams,
  Document,
  encodeFilters,
  getBulldozerError,
  UpdateCollectionParams,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaApiService } from '@heavy-duty/ngx-solana';
import { Keypair, PublicKey } from '@solana/web3.js';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CollectionApiService {
  constructor(private readonly _ngxSolanaApiService: NgxSolanaApiService) {}

  // get collections
  find(filters: CollectionFilters) {
    return this._ngxSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), {
        filters: encodeFilters(COLLECTION_ACCOUNT_NAME, filters),
      })
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createCollectionDocument(new PublicKey(pubkey), account)
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
            accountInfo &&
            createCollectionDocument(new PublicKey(collectionId), accountInfo)
        )
      );
  }

  // create collection
  create(params: Omit<CreateCollectionParams, 'collectionId'>) {
    const collectionKeypair = Keypair.generate();

    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) => {
        transaction.add(
          createCreateCollectionInstruction2({
            ...params,
            collectionId: collectionKeypair.publicKey.toBase58(),
          })
        );
        transaction.partialSign(collectionKeypair);
        return transaction;
      })
      .pipe(
        catchError((error) => {
          if (
            'InstructionError' in error &&
            error.InstructionError.length === 2 &&
            typeof error.InstructionError[1].Custom === 'number'
          ) {
            return throwError(() =>
              getBulldozerError(error.InstructionError[1].Custom)
            );
          }

          return throwError(() => error);
        })
      );
  }

  // update collection
  update(params: UpdateCollectionParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(createUpdateCollectionInstruction2(params))
      )
      .pipe(
        catchError((error) => {
          if (
            'InstructionError' in error &&
            error.InstructionError.length === 2 &&
            typeof error.InstructionError[1].Custom === 'number'
          ) {
            return throwError(() =>
              getBulldozerError(error.InstructionError[1].Custom)
            );
          }

          return throwError(() => error);
        })
      );
  }

  // delete collection
  delete(params: DeleteCollectionParams) {
    return this._ngxSolanaApiService
      .createAndSendTransaction(params.authority, (transaction) =>
        transaction.add(createDeleteCollectionInstruction2(params))
      )
      .pipe(
        catchError((error) => {
          if (
            'InstructionError' in error &&
            error.InstructionError.length === 2 &&
            typeof error.InstructionError[1].Custom === 'number'
          ) {
            return throwError(() =>
              getBulldozerError(error.InstructionError[1].Custom)
            );
          }

          return throwError(() => error);
        })
      );
  }
}
