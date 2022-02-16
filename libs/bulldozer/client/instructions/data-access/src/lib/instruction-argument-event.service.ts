import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createInstructionArgumentDocument,
  Document,
  InstructionArgument,
  InstructionArgumentFilters,
  instructionArgumentQueryBuilder,
} from '@heavy-duty/bulldozer-devkit';
import { HdSolanaConnectionStore } from '@heavy-duty/ngx-solana';
import { concatMap, EMPTY, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionArgumentEventService {
  constructor(
    private readonly _hdSolanaConnectionStore: HdSolanaConnectionStore
  ) {}

  instructionArgumentChanges(
    instructionArgumentId: string
  ): Observable<Document<InstructionArgument> | null> {
    return this._hdSolanaConnectionStore
      .onAccountChange(instructionArgumentId)
      .pipe(
        map((accountInfo) =>
          accountInfo.lamports > 0
            ? createInstructionArgumentDocument(
                instructionArgumentId,
                accountInfo
              )
            : null
        )
      );
  }

  instructionArgumentCreated(
    filters: InstructionArgumentFilters
  ): Observable<Document<InstructionArgument>> {
    const query = instructionArgumentQueryBuilder()
      .where(filters)
      .setCommitment('finalized')
      .build();

    return this._hdSolanaConnectionStore
      .onProgramAccountChange(BULLDOZER_PROGRAM_ID.toBase58(), query)
      .pipe(
        concatMap(({ account, pubkey }) => {
          if (account.lamports === 0) {
            return EMPTY;
          } else {
            const document = createInstructionArgumentDocument(pubkey, account);

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
