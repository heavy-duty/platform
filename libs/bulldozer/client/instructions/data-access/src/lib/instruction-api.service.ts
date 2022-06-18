import { Injectable } from '@angular/core';
import {
	BULLDOZER_PROGRAM_ID,
	createInstruction,
	createInstructionDocument,
	CreateInstructionParams,
	deleteInstruction,
	DeleteInstructionParams,
	Document,
	Instruction,
	InstructionFilters,
	instructionQueryBuilder,
	parseBulldozerError,
	updateInstruction,
	updateInstructionBody,
	UpdateInstructionParams,
} from '@heavy-duty/bulldozer-devkit';
import {
	HdSolanaApiService,
	HdSolanaConfigStore,
} from '@heavy-duty/ngx-solana';
import {
	addInstructionToTransaction,
	partiallySignTransaction,
} from '@heavy-duty/rx-solana';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import {
	Connection,
	Finality,
	Keypair,
	Transaction,
	TransactionSignature,
} from '@solana/web3.js';
import {
	catchError,
	concatMap,
	first,
	firstValueFrom,
	lastValueFrom,
	map,
	Observable,
	throwError,
} from 'rxjs';
import { UpdateInstructionBodyParams } from './types';

@Injectable({ providedIn: 'root' })
export class InstructionApiService {
	private readonly connection = new Connection('http://localhost:8899');

	constructor(
		private readonly _hdSolanaApiService: HdSolanaApiService,
		private readonly _hdSolanaConfigStore: HdSolanaConfigStore,
		private readonly _walletStore: WalletStore
	) {}

	private handleError(error: string) {
		return throwError(() => parseBulldozerError(error) ?? null);
	}

	// get instruction ids
	findIds(filters: InstructionFilters, commitment: Finality = 'finalized') {
		const query = instructionQueryBuilder().where(filters).build();

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

	// get instruction
	findById(
		instructionId: string,
		commitment: Finality = 'finalized'
	): Observable<Document<Instruction> | null> {
		return this._hdSolanaApiService
			.getAccountInfo(instructionId, commitment)
			.pipe(
				map(
					(accountInfo) =>
						accountInfo && createInstructionDocument(instructionId, accountInfo)
				)
			);
	}

	// get instructions
	findByIds(instructionIds: string[], commitment: Finality = 'finalized') {
		return this._hdSolanaApiService
			.getMultipleAccounts(instructionIds, { commitment })
			.pipe(
				map((keyedAccounts) =>
					keyedAccounts.map(
						(keyedAccount) =>
							keyedAccount &&
							createInstructionDocument(
								keyedAccount.accountId,
								keyedAccount.accountInfo
							)
					)
				)
			);
	}

	// create instruction
	create(
		instructionKeypair: Keypair,
		params: Omit<CreateInstructionParams, 'instructionId'>
	): Observable<{
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

						return createInstruction(apiEndpoint, {
							...params,
							instructionId: instructionKeypair.publicKey.toBase58(),
						});
					})
				)
			),
			partiallySignTransaction(instructionKeypair),
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

	// update instruction
	update(params: UpdateInstructionParams): Observable<{
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

						return updateInstruction(apiEndpoint, params);
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

	// update instruction body
	async updateBody(params: UpdateInstructionBodyParams): Promise<boolean> {
		console.log(
			'WARNING: This implementation should be turned into an observable for consistency.'
		);

		const chunkSize = 500;

		const { blockhash, lastValidBlockHeight } =
			await this.connection.getLatestBlockhash();
		const publicKey = await firstValueFrom(this._walletStore.publicKey$);

		if (publicKey === null) {
			throw new Error('Connect your wallet to send transactions.');
		}

		const transaction1 = new Transaction({
			blockhash,
			lastValidBlockHeight,
			feePayer: publicKey,
		}).add(
			await firstValueFrom(
				updateInstructionBody(this.connection.rpcEndpoint, {
					...params,
					chunk: 0,
					body: params.body.slice(0, chunkSize),
				})
			)
		);

		const transaction2 = new Transaction({
			blockhash,
			lastValidBlockHeight,
			feePayer: publicKey,
		}).add(
			await firstValueFrom(
				updateInstructionBody(this.connection.rpcEndpoint, {
					...params,
					chunk: 1,
					body: params.body.slice(chunkSize, 2 * chunkSize),
				})
			)
		);

		const transaction3 = new Transaction({
			blockhash,
			lastValidBlockHeight,
			feePayer: publicKey,
		}).add(
			await firstValueFrom(
				updateInstructionBody(this.connection.rpcEndpoint, {
					...params,
					chunk: 2,
					body: params.body.slice(2 * chunkSize, 3 * chunkSize),
				})
			)
		);

		const transaction4 = new Transaction({
			blockhash,
			lastValidBlockHeight,
			feePayer: publicKey,
		}).add(
			await firstValueFrom(
				updateInstructionBody(this.connection.rpcEndpoint, {
					...params,
					chunk: 3,
					body: params.body.slice(3 * chunkSize, 4 * chunkSize),
				})
			)
		);

		const signAllTransactions$ = this._walletStore.signAllTransactions([
			transaction1,
			transaction2,
			transaction3,
			transaction4,
		]);

		if (signAllTransactions$ === undefined) {
			throw new Error('Wallet connected cannot sign.');
		}

		const transactions = await lastValueFrom(signAllTransactions$);

		const signatures = await Promise.all(
			transactions.map((transaction) =>
				this.connection.sendRawTransaction(transaction.serialize())
			)
		);

		await Promise.all(
			signatures.map((signature) =>
				this.connection.confirmTransaction({
					signature,
					lastValidBlockHeight,
					blockhash,
				})
			)
		);

		return true;
	}

	// delete instruction
	delete(params: DeleteInstructionParams): Observable<{
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

						return deleteInstruction(apiEndpoint, params);
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
