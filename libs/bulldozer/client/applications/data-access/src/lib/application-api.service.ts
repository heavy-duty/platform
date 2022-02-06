import { Injectable } from '@angular/core';
import {
  Application,
  ApplicationFilters,
  APPLICATION_ACCOUNT_NAME,
  BULLDOZER_PROGRAM_ID,
  createApplicationDocument,
  CreateApplicationParams,
  createCreateApplicationInstruction2,
  createDeleteApplicationInstruction2,
  createUpdateApplicationInstruction2,
  DeleteApplicationParams,
  Document,
  encodeFilters,
  UpdateApplicationParams,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaApiService } from '@heavy-duty/ngx-solana';
import { Keypair, PublicKey } from '@solana/web3.js';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApplicationApiService {
  constructor(private readonly _ngxSolanaApiService: NgxSolanaApiService) {}

  // get applications
  find(filters: ApplicationFilters) {
    return this._ngxSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), {
        filters: encodeFilters(APPLICATION_ACCOUNT_NAME, filters),
      })
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createApplicationDocument(new PublicKey(pubkey), account)
          )
        )
      );
  }

  // get application
  findByPublicKey(
    applicationPublicKey: string
  ): Observable<Document<Application> | null> {
    return this._ngxSolanaApiService
      .getAccountInfo(applicationPublicKey)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo &&
            createApplicationDocument(
              new PublicKey(applicationPublicKey),
              accountInfo
            )
        )
      );
  }

  // create application
  create(params: Omit<CreateApplicationParams, 'applicationId'>) {
    const applicationKeypair = Keypair.generate();

    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) => {
        transaction.add(
          createCreateApplicationInstruction2({
            ...params,
            applicationId: applicationKeypair.publicKey.toBase58(),
          })
        );
        transaction.partialSign(applicationKeypair);
        return transaction;
      }
    );
  }

  // update application
  update(params: UpdateApplicationParams) {
    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) =>
        transaction.add(createUpdateApplicationInstruction2(params))
    );
  }

  // delete application
  delete(params: DeleteApplicationParams) {
    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) =>
        transaction.add(createDeleteApplicationInstruction2(params))
    );
  }
}
