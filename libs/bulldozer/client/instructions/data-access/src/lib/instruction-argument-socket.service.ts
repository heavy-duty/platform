import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createInstructionArgumentDocument,
  Document,
  encodeFilters,
  InstructionArgument,
  InstructionArgumentFilters,
  INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaSocketService } from '@heavy-duty/ngx-solana';
import { PublicKey } from '@solana/web3.js';
import { concatMap, EMPTY, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionArgumentSocketService {
  constructor(
    private readonly _ngxSolanaSocketService: NgxSolanaSocketService
  ) {}

  instructionArgumentChanges(
    instructionArgumentPublicKey: string
  ): Observable<Document<InstructionArgument> | null> {
    return this._ngxSolanaSocketService
      .onAccountChange(instructionArgumentPublicKey)
      .pipe(
        map((accountInfo) =>
          accountInfo.lamports > 0
            ? createInstructionArgumentDocument(
                new PublicKey(instructionArgumentPublicKey),
                accountInfo
              )
            : null
        )
      );
  }

  instructionArgumentCreated(
    filters: InstructionArgumentFilters
  ): Observable<Document<InstructionArgument>> {
    return this._ngxSolanaSocketService
      .onProgramAccountChange(BULLDOZER_PROGRAM_ID.toBase58(), {
        filters: encodeFilters(INSTRUCTION_ARGUMENT_ACCOUNT_NAME, filters),
        commitment: 'finalized',
      })
      .pipe(
        concatMap(({ account, pubkey }) => {
          if (account.lamports === 0) {
            return EMPTY;
          } else {
            const document = createInstructionArgumentDocument(
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
