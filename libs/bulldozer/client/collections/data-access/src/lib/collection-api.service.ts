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
  UpdateCollectionParams,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaApiService } from '@heavy-duty/ngx-solana';
import { Keypair, PublicKey } from '@solana/web3.js';
import { map, Observable } from 'rxjs';

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
  findByPublicKey(
    collectionPublicKey: string
  ): Observable<Document<Collection> | null> {
    return this._ngxSolanaApiService
      .getAccountInfo(collectionPublicKey)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo &&
            createCollectionDocument(
              new PublicKey(collectionPublicKey),
              accountInfo
            )
        )
      );
  }

  // create collection
  create(params: Omit<CreateCollectionParams, 'collectionId'>) {
    const collectionKeypair = Keypair.generate();

    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) => {
        transaction.add(
          createCreateCollectionInstruction2({
            ...params,
            collectionId: collectionKeypair.publicKey.toBase58(),
          })
        );
        transaction.partialSign(collectionKeypair);
        return transaction;
      }
    );
  }

  // update collection
  update(params: UpdateCollectionParams) {
    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) =>
        transaction.add(createUpdateCollectionInstruction2(params))
    );
  }

  // delete collection
  delete(params: DeleteCollectionParams) {
    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) =>
        transaction.add(createDeleteCollectionInstruction2(params))
    );
  }
}
