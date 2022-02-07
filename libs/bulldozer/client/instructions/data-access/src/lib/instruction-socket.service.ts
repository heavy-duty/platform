import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createInstructionDocument,
  Document,
  encodeFilters,
  Instruction,
  InstructionFilters,
  INSTRUCTION_ACCOUNT_NAME,
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
    instructionId: string
  ): Observable<Document<Instruction> | null> {
    return this._ngxSolanaSocketService
      .onAccountChange(instructionId)
      .pipe(
        map((accountInfo) =>
          accountInfo.lamports > 0
            ? createInstructionDocument(
                new PublicKey(instructionId),
                accountInfo
              )
            : null
        )
      );
  }

  instructionCreated(filters: InstructionFilters) {
    return this._ngxSolanaSocketService
      .onProgramAccountChange(BULLDOZER_PROGRAM_ID.toBase58(), {
        filters: encodeFilters(INSTRUCTION_ACCOUNT_NAME, filters),
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
