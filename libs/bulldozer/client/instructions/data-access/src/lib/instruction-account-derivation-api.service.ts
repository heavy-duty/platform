import { Injectable } from '@angular/core';
import {
	createInstructionAccountDerivationDocument,
	Document,
	InstructionAccountDerivation,
} from '@heavy-duty/bulldozer-devkit';
import { HdSolanaApiService, KeyedAccountInfo } from '@heavy-duty/ngx-solana';
import { Finality } from '@solana/web3.js';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionAccountDerivationApiService {
	constructor(private readonly _hdSolanaApiService: HdSolanaApiService) {}

	// get instruction account
	findById(
		instructionAccountDerivationId: string,
		commitment: Finality = 'finalized'
	): Observable<Document<InstructionAccountDerivation> | null> {
		return this._hdSolanaApiService
			.getAccountInfo(instructionAccountDerivationId, commitment)
			.pipe(
				map((accountInfo) => {
					if (accountInfo === null) {
						return null;
					}

					return createInstructionAccountDerivationDocument(
						instructionAccountDerivationId,
						accountInfo
					);
				})
			);
	}

	// get instruction accounts
	findByIds(
		instructionAccountDerivationIds: string[],
		commitment: Finality = 'finalized'
	): Observable<Document<InstructionAccountDerivation>[]> {
		return this._hdSolanaApiService
			.getMultipleAccounts(instructionAccountDerivationIds, { commitment })
			.pipe(
				map((keyedAccounts) =>
					keyedAccounts
						.filter(
							(keyedAccount): keyedAccount is KeyedAccountInfo =>
								keyedAccount !== null
						)
						.map((keyedAccount) =>
							createInstructionAccountDerivationDocument(
								keyedAccount.accountId,
								keyedAccount.accountInfo
							)
						)
				)
			);
	}
}
