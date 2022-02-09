import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createInstructionDocument,
  Document,
  Instruction,
  InstructionFilters,
  instructionQueryBuilder,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaSocketService } from '@heavy-duty/ngx-solana';
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
            ? createInstructionDocument(instructionId, accountInfo)
            : null
        )
      );
  }

  instructionCreated(filters: InstructionFilters) {
    const query = instructionQueryBuilder()
      .where(filters)
      .setCommitment('finalized')
      .build();

    return this._ngxSolanaSocketService
      .onProgramAccountChange(BULLDOZER_PROGRAM_ID.toBase58(), query)
      .pipe(
        concatMap(({ account, pubkey }) => {
          if (account.lamports === 0) {
            return EMPTY;
          } else {
            const document = createInstructionDocument(pubkey, account);

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
