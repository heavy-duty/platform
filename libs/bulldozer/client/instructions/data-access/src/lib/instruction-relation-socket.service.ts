import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createInstructionRelationRelation,
  encodeFilters,
  InstructionRelation,
  InstructionRelationFilters,
  INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
  Relation,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaSocketService } from '@heavy-duty/ngx-solana';
import { PublicKey } from '@solana/web3.js';
import { concatMap, EMPTY, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionRelationSocketService {
  constructor(
    private readonly _ngxSolanaSocketService: NgxSolanaSocketService
  ) {}

  instructionRelationChanges(
    instructionRelationPublicKey: string
  ): Observable<Relation<InstructionRelation> | null> {
    return this._ngxSolanaSocketService
      .onAccountChange(instructionRelationPublicKey)
      .pipe(
        map((accountInfo) =>
          accountInfo.lamports > 0
            ? createInstructionRelationRelation(
                new PublicKey(instructionRelationPublicKey),
                accountInfo
              )
            : null
        )
      );
  }

  instructionRelationCreated(
    filters: InstructionRelationFilters
  ): Observable<Relation<InstructionRelation>> {
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
            const document = createInstructionRelationRelation(
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
