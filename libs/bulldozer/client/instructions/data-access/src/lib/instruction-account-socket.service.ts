import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createInstructionAccountDocument,
  Document,
  encodeFilters,
  InstructionAccount,
  InstructionAccountFilters,
  INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaSocketService } from '@heavy-duty/ngx-solana';
import { PublicKey } from '@solana/web3.js';
import { concatMap, EMPTY, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionAccountSocketService {
  constructor(
    private readonly _ngxSolanaSocketService: NgxSolanaSocketService
  ) {}

  instructionAccountChanges(
    instructionAccountPublicKey: string
  ): Observable<Document<InstructionAccount> | null> {
    return this._ngxSolanaSocketService
      .onAccountChange(instructionAccountPublicKey)
      .pipe(
        map((accountInfo) =>
          accountInfo.lamports > 0
            ? createInstructionAccountDocument(
                new PublicKey(instructionAccountPublicKey),
                accountInfo
              )
            : null
        )
      );
  }

  instructionAccountCreated(
    filters: InstructionAccountFilters
  ): Observable<Document<InstructionAccount>> {
    return this._ngxSolanaSocketService
      .onProgramAccountChange(BULLDOZER_PROGRAM_ID.toBase58(), {
        filters: encodeFilters(INSTRUCTION_ACCOUNT_ACCOUNT_NAME, filters),
        commitment: 'finalized',
      })
      .pipe(
        concatMap(({ account, pubkey }) => {
          if (account.lamports === 0) {
            return EMPTY;
          } else {
            const document = createInstructionAccountDocument(
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
