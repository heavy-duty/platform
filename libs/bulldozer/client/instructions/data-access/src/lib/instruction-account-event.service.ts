import { Injectable } from '@angular/core';
import { HdSolanaConnectionStore } from '@heavy-duty/ngx-solana';

@Injectable({ providedIn: 'root' })
export class InstructionAccountEventService {
  constructor(
    private readonly _hdSolanaConnectionStore: HdSolanaConnectionStore
  ) {}

  /* instructionAccountChanges(
    instructionAccountId: string
  ): Observable<Document<InstructionAccount> | null> {
    return this._hdSolanaConnectionStore
      .onAccountChange(instructionAccountId)
      .pipe(
        map((accountInfo) =>
          accountInfo.lamports > 0
            ? createInstructionAccountDocument(
                instructionAccountId,
                accountInfo
              )
            : null
        )
      );
  } */

  /* instructionAccountCreated(
    filters: InstructionAccountFilters
  ): Observable<Document<InstructionAccount>> {
    const query = instructionAccountQueryBuilder()
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
            const document = createInstructionAccountDocument(pubkey, account);

            if (
              document.updatedAt !== undefined &&
              document.createdAt.eq(document.updatedAt)
            ) {
              return of(document);
            } else {
              return EMPTY;
            }
          }
        })
      );
  } */
}
