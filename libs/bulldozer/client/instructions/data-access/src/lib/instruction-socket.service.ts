import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  COLLECTION_ACCOUNT_NAME,
  createInstructionDocument,
  Document,
  encodeFilters,
  Instruction,
  InstructionFilters,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaSocketService } from '@heavy-duty/ngx-solana';
import { PublicKey } from '@solana/web3.js';
import { concatMap, EMPTY, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionSocketService {
  constructor(
    private readonly _ngxSolanaSocketService: NgxSolanaSocketService
  ) {}

  instructionChanges(
    instructionPublicKey: string
  ): Observable<Document<Instruction> | null> {
    return this._ngxSolanaSocketService
      .onAccountChange(instructionPublicKey)
      .pipe(
        map((accountInfo) =>
          accountInfo.lamports > 0
            ? createInstructionDocument(
                new PublicKey(instructionPublicKey),
                accountInfo
              )
            : null
        )
      );
  }

  instructionCreated(filters: InstructionFilters) {
    return this._ngxSolanaSocketService
      .onProgramAccountChange(BULLDOZER_PROGRAM_ID.toBase58(), {
        filters: encodeFilters(COLLECTION_ACCOUNT_NAME, filters),
        commitment: 'finalized',
      })
      .pipe(
        concatMap(({ account, pubkey }) => {
          if (account.lamports === 0) {
            return EMPTY;
          } else {
            const document = createInstructionDocument(
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
