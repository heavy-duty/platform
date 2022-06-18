import { Injectable } from '@angular/core';
import {
	BULLDOZER_PROGRAM_ID,
	createInstructionAccountConstraint,
	createInstructionAccountConstraintDocument,
	CreateInstructionAccountConstraintParams,
	deleteInstructionAccountConstraint,
	DeleteInstructionAccountConstraintParams,
	Document,
	InstructionAccountConstraint,
	InstructionAccountConstraintFilters,
	instructionAccountConstraintQueryBuilder,
	parseBulldozerError,
	updateInstructionAccountConstraint,
	UpdateInstructionAccountConstraintParams,
} from '@heavy-duty/bulldozer-devkit';
import {
	HdSolanaApiService,
	HdSolanaConfigStore,
	KeyedAccountInfo,
} from '@heavy-duty/ngx-solana';
import {
	addInstructionToTransaction,
	partiallySignTransaction,
} from '@heavy-duty/rx-solana';
import { Finality, Keypair } from '@solana/web3.js';
import {
	catchError,
	concatMap,
	first,
	map,
	Observable,
	throwError,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionAccountConstraintApiService {
	constructor(
		private readonly _hdSolanaApiService: HdSolanaApiService,
		private readonly _hdSolanaConfigStore: HdSolanaConfigStore
	) {}

	private handleError(error: string) {
		return throwError(() => parseBulldozerError(error) ?? null);
	}

	// get instruction account constraint ids
	findIds(
		filters: InstructionAccountConstraintFilters,
		commitment: Finality = 'finalized'
	) {
		const query = instructionAccountConstraintQueryBuilder()
			.where(filters)
			.build();

		return this._hdSolanaApiService
			.getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), {
				...query,
				dataSlice: {
					offset: 0,
					length: 0,
				},
				commitment,
			})
			.pipe(
				map((programAccounts) => programAccounts.map(({ pubkey }) => pubkey))
			);
	}

	// get instruction account constraint
	findById(
		instructionAccountConstraintId: string,
		commitment: Finality = 'finalized'
	): Observable<Document<InstructionAccountConstraint> | null> {
		return this._hdSolanaApiService
			.getAccountInfo(instructionAccountConstraintId, commitment)
			.pipe(
				map((accountInfo) => {
					if (accountInfo === null) {
						return null;
					}

					return createInstructionAccountConstraintDocument(
						instructionAccountConstraintId,
						accountInfo
					);
				})
			);
	}

	// get instruction account constraints
	findByIds(
		instructionAccountConstraintIds: string[],
		commitment: Finality = 'finalized'
	): Observable<Document<InstructionAccountConstraint>[]> {
		return this._hdSolanaApiService
			.getMultipleAccounts(instructionAccountConstraintIds, { commitment })
			.pipe(
				map((keyedAccounts) =>
					keyedAccounts
						.filter(
							(keyedAccount): keyedAccount is KeyedAccountInfo =>
								keyedAccount !== null
						)
						.map((keyedAccount) =>
							createInstructionAccountConstraintDocument(
								keyedAccount.accountId,
								keyedAccount.accountInfo
							)
						)
				)
			);
	}

	// create instruction account constraint
	create(
		instructionAccountConstraintKeypair: Keypair,
		params: Omit<
			CreateInstructionAccountConstraintParams,
			'instructionAccountConstraintId'
		>
	) {
		return this._hdSolanaApiService.createTransaction(params.authority).pipe(
			addInstructionToTransaction(
				this._hdSolanaConfigStore.apiEndpoint$.pipe(
					first(),
					concatMap((apiEndpoint) => {
						if (apiEndpoint === null) {
							return throwError(() => 'API endpoint missing');
						}

						return createInstructionAccountConstraint(apiEndpoint, {
							...params,
							instructionAccountConstraintId:
								instructionAccountConstraintKeypair.publicKey.toBase58(),
						});
					})
				)
			),
			partiallySignTransaction(instructionAccountConstraintKeypair),
			concatMap((transaction) =>
				this._hdSolanaApiService.sendTransaction(transaction).pipe(
					map((transactionSignature) => ({
						transactionSignature,
						transaction,
					})),
					catchError((error) => this.handleError(error))
				)
			)
		);
	}

	// update instruction account constraint
	update(params: UpdateInstructionAccountConstraintParams) {
		return this._hdSolanaApiService.createTransaction(params.authority).pipe(
			addInstructionToTransaction(
				this._hdSolanaConfigStore.apiEndpoint$.pipe(
					first(),
					concatMap((apiEndpoint) => {
						if (apiEndpoint === null) {
							return throwError(() => 'API endpoint missing');
						}

						return updateInstructionAccountConstraint(apiEndpoint, params);
					})
				)
			),
			concatMap((transaction) =>
				this._hdSolanaApiService.sendTransaction(transaction).pipe(
					map((transactionSignature) => ({
						transactionSignature,
						transaction,
					})),
					catchError((error) => this.handleError(error))
				)
			)
		);
	}

	// delete instruction account constraint
	delete(params: DeleteInstructionAccountConstraintParams) {
		return this._hdSolanaApiService.createTransaction(params.authority).pipe(
			addInstructionToTransaction(
				this._hdSolanaConfigStore.apiEndpoint$.pipe(
					first(),
					concatMap((apiEndpoint) => {
						if (apiEndpoint === null) {
							return throwError(() => 'API endpoint missing');
						}

						return deleteInstructionAccountConstraint(apiEndpoint, params);
					})
				)
			),
			concatMap((transaction) =>
				this._hdSolanaApiService.sendTransaction(transaction).pipe(
					map((transactionSignature) => ({
						transactionSignature,
						transaction,
					})),
					catchError((error) => this.handleError(error))
				)
			)
		);
	}
}
