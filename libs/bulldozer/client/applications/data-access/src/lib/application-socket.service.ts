import { Injectable } from '@angular/core';
import {
  Application,
  ApplicationFilters,
  APPLICATION_ACCOUNT_NAME,
  BULLDOZER_PROGRAM_ID,
  createApplicationDocument,
  Document,
  encodeFilters,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaSocketService } from '@heavy-duty/ngx-solana';
import { PublicKey } from '@solana/web3.js';
import { concatMap, EMPTY, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApplicationSocketService {
  constructor(
    private readonly _ngxSolanaSocketService: NgxSolanaSocketService
  ) {}

  applicationChanges(
    applicationId: string
  ): Observable<Document<Application> | null> {
    return this._ngxSolanaSocketService
      .onAccountChange(applicationId)
      .pipe(
        map((accountInfo) =>
          accountInfo.lamports > 0
            ? createApplicationDocument(
                new PublicKey(applicationId),
                accountInfo
              )
            : null
        )
      );
  }

  applicationCreated(filters: ApplicationFilters) {
    return this._ngxSolanaSocketService
      .onProgramAccountChange(BULLDOZER_PROGRAM_ID.toBase58(), {
        filters: encodeFilters(APPLICATION_ACCOUNT_NAME, filters),
        commitment: 'finalized',
      })
      .pipe(
        concatMap(({ account, pubkey }) => {
          if (account.lamports === 0) {
            return EMPTY;
          } else {
            const document = createApplicationDocument(
              new PublicKey(pubkey),
              account
            );

            if (document.createdAt.eq(document.updatedAt)) {
              return of(document);
            } else {
              return EMPTY;
            }
          }
        })
      );
  }
}
