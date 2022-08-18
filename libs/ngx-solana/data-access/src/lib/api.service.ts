import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
	AccountInfo,
	Commitment,
	ConfirmedTransactionMeta,
	Finality,
	GetMultipleAccountsConfig,
	GetProgramAccountsConfig,
	PublicKey,
	SignaturesForAddressOptions,
	SignatureStatus,
	Transaction,
	TransactionError,
	TransactionSignature,
} from '@solana/web3.js';
import {
	concatMap,
	first,
	from,
	isObservable,
	map,
	mergeMap,
	Observable,
	of,
	throwError,
	toArray,
} from 'rxjs';
import { HdSolanaConfigStore } from './config.store';

export interface KeyedAccountInfo {
	accountId: string;
	accountInfo: AccountInfo<Buffer>;
}

export interface TransactionResponse<T> {
	slot: number;
	transaction: T;
	meta: ConfirmedTransactionMeta | null;
	blockTime?: number | null;
}

export type ConfirmedSignatureInfo = {
	signature: string;
	slot: number;
	err: TransactionError | null;
	memo: string | null;
	blockTime?: number | null;
	confirmationStatus: Finality;
};

export interface TransactionStatus2 {
	signature: TransactionSignature;
	transactionResponse: TransactionResponse<Transaction>;
	status: Finality;
}

@Injectable()
export class HdSolanaApiService {
	constructor(
		private readonly _hdSolanaConfigStore: HdSolanaConfigStore,
		private readonly _httpClient: HttpClient
	) {}

	createAndSendTransaction(
		feePayer: string,
		beforeSendFunction: (transaction: Transaction) => Transaction
	) {
		return this.getLatestBlockhash().pipe(
			concatMap(({ blockhash, lastValidBlockHeight }) =>
				this.sendTransaction(
					beforeSendFunction(
						new Transaction({
							feePayer: new PublicKey(feePayer),
							blockhash,
							lastValidBlockHeight,
						})
					)
				)
			)
		);
	}

	createTransaction(feePayer: string) {
		return this.getLatestBlockhash().pipe(
			map(
				({ blockhash }) =>
					new Transaction({
						feePayer: new PublicKey(feePayer),
						recentBlockhash: blockhash,
					})
			)
		);
	}

	getAccountInfo(
		pubkey: string,
		commitment = 'confirmed'
	): Observable<AccountInfo<Buffer> | null> {
		return this._hdSolanaConfigStore.apiEndpoint$.pipe(
			first(),
			concatMap((apiEndpoint) => {
				if (apiEndpoint === null) {
					return throwError(() => 'API endpoint missing');
				}

				return this._httpClient
					.post<{
						value: AccountInfo<[string, string]>;
						context: { slot: number };
					}>(apiEndpoint, [pubkey, { encoding: 'base64', commitment }], {
						headers: {
							'solana-rpc-method': 'getAccountInfo',
						},
					})
					.pipe(
						map(
							({ value }) =>
								value && {
									...value,
									data: Buffer.from(value.data[0], 'base64'),
								}
						)
					);
			})
		);
	}

	getBalance(pubkey: string) {
		return this._hdSolanaConfigStore.apiEndpoint$.pipe(
			first(),
			concatMap((apiEndpoint) => {
				if (apiEndpoint === null) {
					return throwError(() => 'API endpoint missing');
				}

				return this._httpClient.post<{ value: number }>(apiEndpoint, pubkey, {
					headers: {
						'solana-rpc-method': 'getBalance',
					},
				});
			})
		);
	}

	getProgramAccounts(programId: string, config?: GetProgramAccountsConfig) {
		return this._hdSolanaConfigStore.apiEndpoint$.pipe(
			first(),
			concatMap((apiEndpoint) => {
				if (apiEndpoint === null) {
					return throwError(() => 'API endpoint missing');
				}

				return this._httpClient
					.post<
						{
							account: AccountInfo<[string, string]>;
							pubkey: string;
						}[]
					>(
						apiEndpoint,
						[
							programId,
							{
								encoding: config?.encoding ?? 'base64',
								commitment: config?.commitment ?? 'confirmed',
								filters: config?.filters ?? [],
								dataSlice: config?.dataSlice,
							},
						],
						{
							headers: {
								'solana-rpc-method': 'getProgramAccounts',
							},
						}
					)
					.pipe(
						map((programAccounts) =>
							programAccounts.map(({ pubkey, account }) => ({
								pubkey,
								account: {
									...account,
									data: Buffer.from(account.data[0], 'base64'),
								},
							}))
						)
					);
			})
		);
	}

	getMinimumBalanceForRentExemption(dataSize: number, commitment?: Commitment) {
		return this._hdSolanaConfigStore.apiEndpoint$.pipe(
			first(),
			concatMap((apiEndpoint) => {
				if (apiEndpoint === null) {
					return throwError(() => 'API endpoint missing');
				}

				return this._httpClient.post<number>(
					apiEndpoint,
					[
						dataSize,
						{
							commitment: commitment ?? 'confirmed',
						},
					],
					{
						headers: {
							'solana-rpc-method': 'getMinimumBalanceForRentExemption',
						},
					}
				);
			})
		);
	}

	getMultipleAccounts(
		pubkeys: string[],
		config?: GetMultipleAccountsConfig
	): Observable<(KeyedAccountInfo | null)[]> {
		return this._hdSolanaConfigStore.apiEndpoint$.pipe(
			first(),
			concatMap((apiEndpoint) => {
				if (apiEndpoint === null) {
					return throwError(() => 'API endpoint missing');
				}

				return this._httpClient
					.post<{
						value: AccountInfo<[string, string]>[];
						context: { slot: number };
					}>(
						apiEndpoint,
						[
							pubkeys,
							{
								commitment: config?.commitment ?? 'confirmed',
							},
						],
						{
							headers: {
								'solana-rpc-method': 'getMultipleAccounts',
							},
						}
					)
					.pipe(
						map(({ value }) =>
							value.map((account, index) => ({
								accountId: pubkeys[index],
								accountInfo: {
									...account,
									data: Buffer.from(account.data[0], 'base64'),
								},
							}))
						)
					);
			})
		);
	}

	getLatestBlockhash(): Observable<{
		blockhash: string;
		lastValidBlockHeight: number;
	}> {
		return this._hdSolanaConfigStore.apiEndpoint$.pipe(
			first(),
			concatMap((apiEndpoint) => {
				if (apiEndpoint === null) {
					return throwError(() => 'API endpoint missing');
				}

				return this._httpClient
					.post<{ value: { blockhash: string; lastValidBlockHeight: number } }>(
						apiEndpoint,
						null,
						{
							headers: {
								'solana-rpc-method': 'getLatestBlockhash',
							},
						}
					)
					.pipe(map(({ value }) => value));
			})
		);
	}

	getSignatureStatus(signature: string): Observable<SignatureStatus> {
		return this._hdSolanaConfigStore.apiEndpoint$.pipe(
			first(),
			concatMap((apiEndpoint) => {
				if (apiEndpoint === null) {
					return throwError(() => 'API endpoint missing');
				}

				return this._httpClient
					.post<{ value: SignatureStatus[] }>(
						apiEndpoint,
						[[signature], { searchTransactionHistory: true }],
						{
							headers: {
								'solana-rpc-method': 'getSignatureStatuses',
							},
						}
					)
					.pipe(map(({ value: [status] }) => status));
			})
		);
	}

	getSignaturesForAddress(
		address: string,
		config?: SignaturesForAddressOptions,
		commitment?: Finality
	): Observable<ConfirmedSignatureInfo[]> {
		return this._hdSolanaConfigStore.apiEndpoint$.pipe(
			first(),
			concatMap((apiEndpoint) => {
				if (apiEndpoint === null) {
					return throwError(() => 'API endpoint missing');
				}

				return this._httpClient.post<ConfirmedSignatureInfo[]>(
					apiEndpoint,
					[
						address,
						{
							limit: config?.limit,
							before: config?.before,
							until: config?.until,
							commitment: commitment ?? 'finalized',
						},
					],
					{
						headers: {
							'solana-rpc-method': 'getSignaturesForAddress',
						},
					}
				);
			})
		);
	}

	getTransaction(
		signature: string,
		commitment: Finality = 'finalized'
	): Observable<TransactionResponse<Transaction>> {
		return this._hdSolanaConfigStore.apiEndpoint$.pipe(
			first(),
			concatMap((apiEndpoint) => {
				if (apiEndpoint === null) {
					return throwError(() => 'API endpoint missing');
				}

				return this._httpClient
					.post<TransactionResponse<[string, string]>>(
						apiEndpoint,
						[signature, { encoding: 'base64', commitment }],
						{
							headers: {
								'solana-rpc-method': 'getTransaction',
							},
						}
					)
					.pipe(
						map((transactionResponse) => ({
							...transactionResponse,
							transaction: Transaction.from(
								Buffer.from(transactionResponse.transaction[0], 'base64')
							),
						}))
					);
			})
		);
	}

	getConfirmedTransactionsByAddress(
		address: string
	): Observable<TransactionStatus2[]> {
		return this.getSignaturesForAddress(address, undefined, 'confirmed').pipe(
			concatMap((confirmedSignatureInfos) => {
				const reallyConfirmedSignatureInfos = confirmedSignatureInfos.filter(
					(confirmedSignatureInfo) =>
						confirmedSignatureInfo.confirmationStatus === 'confirmed'
				);

				if (reallyConfirmedSignatureInfos.length === 0) {
					return of([]);
				}

				return from(reallyConfirmedSignatureInfos).pipe(
					mergeMap(({ signature }) =>
						this.getTransaction(signature, 'confirmed').pipe(
							map((transactionResponse) => ({
								signature,
								transactionResponse,
								status: 'confirmed' as Finality,
							}))
						)
					),
					toArray()
				);
			})
		);
	}

	sendTransaction(
		transaction: Transaction | Observable<Transaction>
	): Observable<TransactionSignature> {
		return this._hdSolanaConfigStore.apiEndpoint$.pipe(
			first(),
			concatMap((apiEndpoint) => {
				if (apiEndpoint === null) {
					return throwError(() => 'API endpoint missing');
				}

				return (isObservable(transaction) ? transaction : of(transaction)).pipe(
					concatMap((transaction) =>
						this._httpClient.post<TransactionSignature>(
							apiEndpoint,
							transaction,
							{
								headers: {
									'solana-rpc-method': 'sendTransaction',
								},
							}
						)
					)
				);
			})
		);
	}
}
