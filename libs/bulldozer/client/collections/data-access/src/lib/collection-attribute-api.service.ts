import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  CollectionAttribute,
  CollectionAttributeFilters,
  COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
  createCollectionAttributeDocument,
  CreateCollectionAttributeParams,
  createCreateCollectionAttributeInstruction2,
  createDeleteCollectionAttributeInstruction2,
  createUpdateCollectionAttributeInstruction2,
  DeleteCollectionAttributeParams,
  Document,
  encodeFilters,
  UpdateCollectionAttributeParams,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaApiService } from '@heavy-duty/ngx-solana';
import { Keypair, PublicKey } from '@solana/web3.js';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CollectionAttributeApiService {
  constructor(private readonly _ngxSolanaApiService: NgxSolanaApiService) {}

  // get collections
  find(filters: CollectionAttributeFilters) {
    return this._ngxSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), {
        filters: encodeFilters(COLLECTION_ATTRIBUTE_ACCOUNT_NAME, filters),
      })
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createCollectionAttributeDocument(new PublicKey(pubkey), account)
          )
        )
      );
  }

  // get collection
  findByPublicKey(
    collectionPublicKey: string
  ): Observable<Document<CollectionAttribute> | null> {
    return this._ngxSolanaApiService
      .getAccountInfo(collectionPublicKey)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo &&
            createCollectionAttributeDocument(
              new PublicKey(collectionPublicKey),
              accountInfo
            )
        )
      );
  }

  // create collection
  create(
    params: Omit<CreateCollectionAttributeParams, 'collectionAttributeId'>
  ) {
    const collectionKeypair = Keypair.generate();

    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) => {
        transaction.add(
          createCreateCollectionAttributeInstruction2({
            ...params,
            collectionAttributeId: collectionKeypair.publicKey.toBase58(),
          })
        );
        transaction.partialSign(collectionKeypair);
        return transaction;
      }
    );
  }

  // update collection
  update(params: UpdateCollectionAttributeParams) {
    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) =>
        transaction.add(createUpdateCollectionAttributeInstruction2(params))
    );
  }

  // delete collection
  delete(params: DeleteCollectionAttributeParams) {
    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) =>
        transaction.add(createDeleteCollectionAttributeInstruction2(params))
    );
  }
}
