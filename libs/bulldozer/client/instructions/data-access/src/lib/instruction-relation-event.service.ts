import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createInstructionRelationRelation,
  InstructionRelation,
  InstructionRelationFilters,
  instructionRelationQueryBuilder,
  Relation,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaConnectionStore } from '@heavy-duty/ngx-solana';
import { concatMap, EMPTY, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionRelationEventService {
  constructor(private readonly _connectionStore: NgxSolanaConnectionStore) {}

  instructionRelationChanges(
    instructionRelationId: string
  ): Observable<Relation<InstructionRelation> | null> {
    return this._connectionStore
      .onAccountChange(instructionRelationId)
      .pipe(
        map((accountInfo) =>
          accountInfo.lamports > 0
            ? createInstructionRelationRelation(
                instructionRelationId,
                accountInfo
              )
            : null
        )
      );
  }

  instructionRelationCreated(
    filters: InstructionRelationFilters
  ): Observable<Relation<InstructionRelation>> {
    const query = instructionRelationQueryBuilder()
      .where(filters)
      .setCommitment('finalized')
      .build();

    return this._connectionStore
      .onProgramAccountChange(BULLDOZER_PROGRAM_ID.toBase58(), query)
      .pipe(
        concatMap(({ account, pubkey }) => {
          if (account.lamports === 0) {
            return EMPTY;
          } else {
            const document = createInstructionRelationRelation(pubkey, account);

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
