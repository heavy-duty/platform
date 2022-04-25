import { Injectable } from '@angular/core';
import {
  createInstructionAccountCloseDocument,
  Document,
  InstructionAccountClose,
} from '@heavy-duty/bulldozer-devkit';
import { HdSolanaApiService, KeyedAccountInfo } from '@heavy-duty/ngx-solana';
import { Finality } from '@solana/web3.js';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionAccountCloseApiService {
  constructor(private readonly _hdSolanaApiService: HdSolanaApiService) {}

  // get instruction account
  findById(
    instructionAccountCloseId: string,
    commitment: Finality = 'finalized'
  ): Observable<Document<InstructionAccountClose> | null> {
    return this._hdSolanaApiService
      .getAccountInfo(instructionAccountCloseId, commitment)
      .pipe(
        map((accountInfo) => {
          if (accountInfo === null) {
            return null;
          }

          return createInstructionAccountCloseDocument(
            instructionAccountCloseId,
            accountInfo
          );
        })
      );
  }

  // get instruction accounts
  findByIds(
    instructionAccountCloseIds: string[],
    commitment: Finality = 'finalized'
  ): Observable<Document<InstructionAccountClose>[]> {
    return this._hdSolanaApiService
      .getMultipleAccounts(instructionAccountCloseIds, { commitment })
      .pipe(
        map((keyedAccounts) =>
          keyedAccounts
            .filter(
              (keyedAccount): keyedAccount is KeyedAccountInfo =>
                keyedAccount !== null
            )
            .map((keyedAccount) =>
              createInstructionAccountCloseDocument(
                keyedAccount.accountId,
                keyedAccount.accountInfo
              )
            )
        )
      );
  }
}
