import { Injectable } from '@angular/core';
import {
  createInstructionAccountCollectionDocument,
  Document,
  InstructionAccountCollection,
} from '@heavy-duty/bulldozer-devkit';
import { HdSolanaApiService, KeyedAccountInfo } from '@heavy-duty/ngx-solana';
import { Finality } from '@solana/web3.js';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionAccountCollectionApiService {
  constructor(private readonly _hdSolanaApiService: HdSolanaApiService) {}

  // get instruction account
  findById(
    instructionAccountCollectionId: string,
    commitment: Finality = 'finalized'
  ): Observable<Document<InstructionAccountCollection> | null> {
    return this._hdSolanaApiService
      .getAccountInfo(instructionAccountCollectionId, commitment)
      .pipe(
        map((accountInfo) => {
          if (accountInfo === null) {
            return null;
          }

          return createInstructionAccountCollectionDocument(
            instructionAccountCollectionId,
            accountInfo
          );
        })
      );
  }

  // get instruction accounts
  findByIds(
    instructionAccountCollectionIds: string[],
    commitment: Finality = 'finalized'
  ): Observable<Document<InstructionAccountCollection>[]> {
    return this._hdSolanaApiService
      .getMultipleAccounts(instructionAccountCollectionIds, { commitment })
      .pipe(
        map((keyedAccounts) =>
          keyedAccounts
            .filter(
              (keyedAccount): keyedAccount is KeyedAccountInfo =>
                keyedAccount !== null
            )
            .map((keyedAccount) =>
              createInstructionAccountCollectionDocument(
                keyedAccount.accountId,
                keyedAccount.accountInfo
              )
            )
        )
      );
  }
}
