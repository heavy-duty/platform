import { Injectable } from '@angular/core';
import {
  createInstructionAccountPayerDocument,
  Document,
  InstructionAccountPayer,
} from '@heavy-duty/bulldozer-devkit';
import { HdSolanaApiService, KeyedAccountInfo } from '@heavy-duty/ngx-solana';
import { Finality } from '@solana/web3.js';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionAccountPayerApiService {
  constructor(private readonly _hdSolanaApiService: HdSolanaApiService) {}

  // get instruction account
  findById(
    instructionAccountPayerId: string,
    commitment: Finality = 'finalized'
  ): Observable<Document<InstructionAccountPayer> | null> {
    return this._hdSolanaApiService
      .getAccountInfo(instructionAccountPayerId, commitment)
      .pipe(
        map((accountInfo) => {
          if (accountInfo === null) {
            return null;
          }

          return createInstructionAccountPayerDocument(
            instructionAccountPayerId,
            accountInfo
          );
        })
      );
  }

  // get instruction accounts
  findByIds(
    instructionAccountPayerIds: string[],
    commitment: Finality = 'finalized'
  ): Observable<Document<InstructionAccountPayer>[]> {
    return this._hdSolanaApiService
      .getMultipleAccounts(instructionAccountPayerIds, { commitment })
      .pipe(
        map((keyedAccounts) =>
          keyedAccounts
            .filter(
              (keyedAccount): keyedAccount is KeyedAccountInfo =>
                keyedAccount !== null
            )
            .map((keyedAccount) =>
              createInstructionAccountPayerDocument(
                keyedAccount.accountId,
                keyedAccount.accountInfo
              )
            )
        )
      );
  }
}
