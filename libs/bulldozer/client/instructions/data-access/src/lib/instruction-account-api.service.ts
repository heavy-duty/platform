import { Injectable } from '@angular/core';
import {
	addSeedToDerivation,
	BULLDOZER_PROGRAM_ID,
	clearInstructionAccountClose,
	clearInstructionAccountDerivation,
	createInstructionAccount,
	createInstructionAccountDocument,
	CreateInstructionAccountParams,
	deleteInstructionAccount,
	DeleteInstructionAccountParams,
	Document,
	InstructionAccount,
	InstructionAccountFilters,
	instructionAccountQueryBuilder,
	parseBulldozerError,
	setBumpToDerivation,
	setInstructionAccountClose,
	setInstructionAccountCollection,
	setInstructionAccountDerivation,
	setInstructionAccountPayer,
	setTokenConfiguration,
	updateInstructionAccount,
	UpdateInstructionAccountParams,
} from '@heavy-duty/bulldozer-devkit';
import {
	HdSolanaApiService,
	HdSolanaConfigStore,
	KeyedAccountInfo,
} from '@heavy-duty/ngx-solana';
import {
	addInstructionsToTransaction,
	addInstructionToTransaction,
	partiallySignTransaction,
} from '@heavy-duty/rx-solana';
import {
	Finality,
	Keypair,
	Transaction,
	TransactionInstruction,
	TransactionSignature,
} from '@solana/web3.js';
import {
	catchError,
	combineLatest,
	concatMap,
	first,
	forkJoin,
	map,
	Observable,
	of,
	throwError,
} from 'rxjs';
import { UpdateDerivationParams } from './types';

@Injectable({ providedIn: 'root' })
export class InstructionAccountApiService {
	constructor(
		private readonly _hdSolanaApiService: HdSolanaApiService,
		private readonly _hdSolanaConfigStore: HdSolanaConfigStore
	) {}

	private handleError(error: string) {
		return throwError(() => parseBulldozerError(error) ?? null);
	}

	// get instruction account ids
	findIds(
		filters: InstructionAccountFilters,
		commitment: Finality = 'finalized'
	) {
		const query = instructionAccountQueryBuilder().where(filters).build();

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

	// get instruction account
	findById(
		instructionAccountId: string,
		commitment: Finality = 'finalized'
	): Observable<Document<InstructionAccount> | null> {
		return this._hdSolanaApiService
			.getAccountInfo(instructionAccountId, commitment)
			.pipe(
				concatMap((accountInfo) => {
					if (accountInfo === null) {
						return of(null);
					}

					return createInstructionAccountDocument(
						instructionAccountId,
						accountInfo
					);
				})
			);
	}

	// get instruction accounts
	findByIds(
		instructionAccountIds: string[],
		commitment: Finality = 'finalized'
	): Observable<Document<InstructionAccount>[]> {
		return this._hdSolanaApiService
			.getMultipleAccounts(instructionAccountIds, { commitment })
			.pipe(
				concatMap((keyedAccounts) =>
					forkJoin(
						keyedAccounts
							.filter(
								(keyedAccount): keyedAccount is KeyedAccountInfo =>
									keyedAccount !== null
							)
							.map((keyedAccount) =>
								createInstructionAccountDocument(
									keyedAccount.accountId,
									keyedAccount.accountInfo
								)
							)
					)
				)
			);
	}

	// create instruction account
	create(
		instructionAccountKeypair: Keypair,
		params: Omit<CreateInstructionAccountParams, 'instructionAccountId'>
	): Observable<{
		transactionSignature: TransactionSignature;
		transaction: Transaction;
	}> {
		const instructions = [
			this._hdSolanaConfigStore.apiEndpoint$.pipe(
				first(),
				concatMap((apiEndpoint) => {
					if (apiEndpoint === null) {
						return throwError(() => 'API endpoint missing');
					}

					return createInstructionAccount(apiEndpoint, {
						...params,
						instructionAccountId:
							instructionAccountKeypair.publicKey.toBase58(),
					});
				})
			),
		];

		const { kind, modifier, collection, close, payer, mint, tokenAuthority } =
			params.instructionAccountDto;

		if (kind === 0 && collection !== null) {
			instructions.push(
				this._hdSolanaConfigStore.apiEndpoint$.pipe(
					first(),
					concatMap((apiEndpoint) => {
						if (apiEndpoint === null) {
							return throwError(() => 'API endpoint missing');
						}

						return setInstructionAccountCollection(apiEndpoint, {
							...params,
							instructionAccountId:
								instructionAccountKeypair.publicKey.toBase58(),
							collectionId: collection,
						});
					})
				)
			);
		}

		if (modifier === 0 && payer !== null) {
			instructions.push(
				this._hdSolanaConfigStore.apiEndpoint$.pipe(
					first(),
					concatMap((apiEndpoint) => {
						if (apiEndpoint === null) {
							return throwError(() => 'API endpoint missing');
						}

						return setInstructionAccountPayer(apiEndpoint, {
							...params,
							instructionAccountId:
								instructionAccountKeypair.publicKey.toBase58(),
							payer,
						});
					})
				)
			);
		}

		if (kind === 0 && modifier === 1 && close !== null) {
			instructions.push(
				this._hdSolanaConfigStore.apiEndpoint$.pipe(
					first(),
					concatMap((apiEndpoint) => {
						if (apiEndpoint === null) {
							return throwError(() => 'API endpoint missing');
						}

						return setInstructionAccountClose(apiEndpoint, {
							...params,
							instructionAccountId:
								instructionAccountKeypair.publicKey.toBase58(),
							close,
						});
					})
				)
			);
		}

		if (
			kind === 4 &&
			modifier === 0 &&
			mint !== null &&
			tokenAuthority !== null
		) {
			instructions.push(
				this._hdSolanaConfigStore.apiEndpoint$.pipe(
					first(),
					concatMap((apiEndpoint) => {
						if (apiEndpoint === null) {
							return throwError(() => 'API endpoint missing');
						}

						return setTokenConfiguration(apiEndpoint, {
							...params,
							instructionAccountId:
								instructionAccountKeypair.publicKey.toBase58(),
							mint,
							tokenAuthority,
						});
					})
				)
			);
		}

		return this._hdSolanaApiService.createTransaction(params.authority).pipe(
			addInstructionsToTransaction(combineLatest(instructions)),
			partiallySignTransaction(instructionAccountKeypair),
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

	// update instruction account
	update(params: UpdateInstructionAccountParams): Observable<{
		transactionSignature: TransactionSignature;
		transaction: Transaction;
	}> {
		const instructions = [
			this._hdSolanaConfigStore.apiEndpoint$.pipe(
				first(),
				concatMap((apiEndpoint) => {
					if (apiEndpoint === null) {
						return throwError(() => 'API endpoint missing');
					}

					return updateInstructionAccount(apiEndpoint, params);
				})
			),
		];

		const { modifier, close, payer, kind, collection, mint, tokenAuthority } =
			params.instructionAccountDto;

		if (kind === 0 && collection !== null) {
			instructions.push(
				this._hdSolanaConfigStore.apiEndpoint$.pipe(
					first(),
					concatMap((apiEndpoint) => {
						if (apiEndpoint === null) {
							return throwError(() => 'API endpoint missing');
						}

						return setInstructionAccountCollection(apiEndpoint, {
							...params,
							instructionAccountId: params.instructionAccountId,
							collectionId: collection,
						});
					})
				)
			);
		}

		if (modifier === 0 && payer !== null) {
			instructions.push(
				this._hdSolanaConfigStore.apiEndpoint$.pipe(
					first(),
					concatMap((apiEndpoint) => {
						if (apiEndpoint === null) {
							return throwError(() => 'API endpoint missing');
						}

						return setInstructionAccountPayer(apiEndpoint, {
							...params,
							instructionAccountId: params.instructionAccountId,
							payer,
						});
					})
				)
			);
		}

		if (kind === 0 && modifier === 1) {
			instructions.push(
				this._hdSolanaConfigStore.apiEndpoint$.pipe(
					first(),
					concatMap((apiEndpoint) => {
						if (apiEndpoint === null) {
							return throwError(() => 'API endpoint missing');
						}

						if (close === null) {
							return clearInstructionAccountClose(apiEndpoint, {
								...params,
								instructionAccountId: params.instructionAccountId,
							});
						}

						return setInstructionAccountClose(apiEndpoint, {
							...params,
							instructionAccountId: params.instructionAccountId,
							close,
						});
					})
				)
			);
		}

		if (
			kind === 4 &&
			modifier === 0 &&
			mint !== null &&
			tokenAuthority !== null
		) {
			instructions.push(
				this._hdSolanaConfigStore.apiEndpoint$.pipe(
					first(),
					concatMap((apiEndpoint) => {
						if (apiEndpoint === null) {
							return throwError(() => 'API endpoint missing');
						}

						return setTokenConfiguration(apiEndpoint, {
							...params,
							instructionAccountId: params.instructionAccountId,
							mint,
							tokenAuthority,
						});
					})
				)
			);
		}

		return this._hdSolanaApiService.createTransaction(params.authority).pipe(
			addInstructionsToTransaction(combineLatest(instructions)),
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

	updateDerivation(params: UpdateDerivationParams): Observable<{
		transactionSignature: TransactionSignature;
		transaction: Transaction;
	}> {
		return this._hdSolanaConfigStore.apiEndpoint$.pipe(
			first(),
			concatMap((apiEndpoint) => {
				if (apiEndpoint === null) {
					return throwError(() => 'API endpoint missing');
				}

				const instructionMap: {
					clearInstructionAccountDerivation: Observable<TransactionInstruction>;
					setInstructionAccountDerivation: Observable<TransactionInstruction>;
					setBumpToDerivation?: Observable<TransactionInstruction>;
					addSeedToDerivations?: Observable<TransactionInstruction[]>;
				} = {
					clearInstructionAccountDerivation: clearInstructionAccountDerivation(
						apiEndpoint,
						{
							applicationId: params.applicationId,
							authority: params.authority,
							instructionAccountId: params.instructionAccountId,
							instructionId: params.instructionId,
							workspaceId: params.workspaceId,
						}
					),
					setInstructionAccountDerivation: setInstructionAccountDerivation(
						apiEndpoint,
						{
							applicationId: params.applicationId,
							authority: params.authority,
							instructionAccountId: params.instructionAccountId,
							instructionId: params.instructionId,
							workspaceId: params.workspaceId,
							name: params.name,
						}
					),
				};

				if (params.bumpPath !== null) {
					instructionMap.setBumpToDerivation = setBumpToDerivation(
						apiEndpoint,
						{
							applicationId: params.applicationId,
							authority: params.authority,
							instructionAccountId: params.instructionAccountId,
							instructionId: params.instructionId,
							workspaceId: params.workspaceId,
							collectionId: params.bumpPath.collectionId,
							pathId: params.bumpPath.pathId,
							referenceId: params.bumpPath.referenceId,
						}
					);
				}

				if (params.seedPaths !== null && params.seedPaths.size > 0) {
					instructionMap.addSeedToDerivations = forkJoin(
						params.seedPaths
							.map((seedPath) =>
								addSeedToDerivation(apiEndpoint, {
									applicationId: params.applicationId,
									authority: params.authority,
									instructionAccountId: params.instructionAccountId,
									instructionId: params.instructionId,
									workspaceId: params.workspaceId,
									referenceId: seedPath,
								})
							)
							.toArray()
					);
				}

				return forkJoin(instructionMap).pipe(
					concatMap(
						({
							clearInstructionAccountDerivation,
							setInstructionAccountDerivation,
							addSeedToDerivations,
							setBumpToDerivation,
						}) => {
							return this._hdSolanaApiService
								.createTransaction(params.authority)
								.pipe(
									addInstructionsToTransaction(
										[
											clearInstructionAccountDerivation,
											setInstructionAccountDerivation,
											setBumpToDerivation,
											...(addSeedToDerivations ?? []),
										].filter(
											(instruction): instruction is TransactionInstruction =>
												instruction !== undefined
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
					)
				);
			})
		);
	}

	// delete instruction account
	delete(params: DeleteInstructionAccountParams): Observable<{
		transactionSignature: TransactionSignature;
		transaction: Transaction;
	}> {
		return this._hdSolanaApiService.createTransaction(params.authority).pipe(
			addInstructionToTransaction(
				this._hdSolanaConfigStore.apiEndpoint$.pipe(
					first(),
					concatMap((apiEndpoint) => {
						if (apiEndpoint === null) {
							return throwError(() => 'API endpoint missing');
						}

						return deleteInstructionAccount(apiEndpoint, params);
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
