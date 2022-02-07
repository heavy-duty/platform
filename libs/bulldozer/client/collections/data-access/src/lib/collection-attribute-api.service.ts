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

  // get collection attributes
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
              new PublicKey(collectionAttributeId),
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

    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) => {
        transaction.add(
          createCreateCollectionAttributeInstruction2({
            ...params,
            collectionAttributeId:
              collectionAttributeKeypair.publicKey.toBase58(),
          })
        );
        transaction.partialSign(collectionAttributeKeypair);
        return transaction;
      }
    );
  }

  // update collection attribute
  update(params: UpdateCollectionAttributeParams) {
    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) =>
        transaction.add(createUpdateCollectionAttributeInstruction2(params))
    );
  }

  // delete collection attribute
  delete(params: DeleteCollectionAttributeParams) {
    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) =>
        transaction.add(createDeleteCollectionAttributeInstruction2(params))
    );
  }
}
