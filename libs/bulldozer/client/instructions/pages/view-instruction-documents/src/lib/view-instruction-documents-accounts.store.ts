import { Injectable } from '@angular/core';
import { InstructionAccountsStore } from '@bulldozer-client/instructions-data-access';
import {
	HdBroadcasterSocketStore,
	TransactionStatus,
} from '@heavy-duty/broadcaster';
import {
	Document,
	flattenInstructions,
	InstructionAccount,
	InstructionStatus,
} from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined, isTruthy } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { TransactionSignature } from '@solana/web3.js';
import { List } from 'immutable';
import { EMPTY, switchMap, tap } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { reduceInstructions } from './reduce-account-instructions';
import { InstructionAccountItemView } from './types';

const documentToView = (
	instructionAccount: Document<InstructionAccount>
): InstructionAccountItemView => {
	return {
		id: instructionAccount.id,
		name: instructionAccount.name,
		isCreating: false,
		isUpdating: false,
		isDeleting: false,
		kind: instructionAccount.data.kind,
		modifier: instructionAccount.data.modifier,
		instructionId: instructionAccount.data.instruction,
		applicationId: instructionAccount.data.application,
		workspaceId: instructionAccount.data.workspace,
		space: instructionAccount.data.space,
		close: instructionAccount.data.close,
		collection: instructionAccount.data.collection,
		payer: instructionAccount.data.payer,
		derivation: instructionAccount.data.derivation,
		uncheckedExplanation: instructionAccount.data.uncheckedExplanation,
		mint: instructionAccount.data.mint,
		tokenAuthority: instructionAccount.data.tokenAuthority,
	};
};

interface ViewModel {
	instructionId: string | null;
	transactions: List<TransactionStatus>;
}

const initialState: ViewModel = {
	instructionId: null,
	transactions: List(),
};

@Injectable()
export class ViewInstructionDocumentsAccountsStore extends ComponentStore<ViewModel> {
	private readonly _instructionId$ = this.select(
		({ instructionId }) => instructionId
	);
	private readonly _topicName$ = this.select(
		this._instructionId$.pipe(isNotNullOrUndefined),
		(instructionId) => `instructions:${instructionId}:accounts`
	);
	private readonly _instructionStatuses$ = this.select(
		this.select(({ transactions }) => transactions),
		(transactions) =>
			transactions
				.reduce(
					(currentInstructions, transactionStatus) =>
						currentInstructions.concat(flattenInstructions(transactionStatus)),
					List<InstructionStatus>()
				)
				.sort(
					(a, b) =>
						a.transactionStatus.timestamp - b.transactionStatus.timestamp
				)
	);
	readonly accounts$ = this.select(
		this._instructionAccountsStore.instructionAccounts$,
		this._instructionStatuses$,
		(instructionAccounts, instructionStatuses) => {
			if (instructionAccounts === null) {
				return null;
			}

			return instructionStatuses.reduce(
				reduceInstructions,
				instructionAccounts.map(documentToView)
			);
		},
		{ debounce: true }
	);

	constructor(
		private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
		private readonly _instructionAccountsStore: InstructionAccountsStore
	) {
		super(initialState);

		this._instructionAccountsStore.setFilters(
			this.select(
				this._instructionId$.pipe(isNotNullOrUndefined),
				this._hdBroadcasterSocketStore.connected$.pipe(isTruthy),
				(instructionId) => ({ instruction: instructionId })
			)
		);
		this._registerTopic(
			this.select(
				this._hdBroadcasterSocketStore.connected$,
				this._topicName$,
				(connected, topicName) => ({
					connected,
					topicName,
				})
			)
		);
	}

	private readonly _addTransaction = this.updater<TransactionStatus>(
		(state, transaction) => ({
			...state,
			transactions: state.transactions.push(transaction),
		})
	);

	private readonly _removeTransaction = this.updater<TransactionSignature>(
		(state, signature) => ({
			...state,
			transactions: state.transactions.filter(
				(transaction) => transaction.signature !== signature
			),
		})
	);

	readonly setInstructionId = this.updater<string | null>(
		(state, instructionId) => ({
			...state,
			instructionId,
		})
	);

	private readonly _handleTransaction = this.effect<TransactionStatus>(
		tap((transaction) => {
			if (transaction.error !== undefined) {
				this._removeTransaction(transaction.signature);
			} else {
				this._addTransaction(transaction);
			}
		})
	);

	private readonly _registerTopic = this.effect<{
		connected: boolean;
		topicName: string | null;
	}>(
		switchMap(({ connected, topicName }) => {
			if (!connected || topicName === null) {
				return EMPTY;
			}

			this.patchState({ transactions: List() });

			const correlationId = uuid();
			let subscriptionId: string;

			return this._hdBroadcasterSocketStore
				.multiplex(
					() => ({
						event: 'subscribe',
						data: {
							topicName,
							correlationId,
						},
					}),
					() => ({
						event: 'unsubscribe',
						data: { topicName, subscriptionId },
					}),
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(message: any) => {
						if (
							typeof message === 'object' &&
							message !== null &&
							'data' in message &&
							'id' in message.data &&
							'subscriptionId' in message.data &&
							message.data.id === correlationId
						) {
							subscriptionId = message.data.subscriptionId;
						}

						return (
							message.data.subscriptionId === subscriptionId &&
							message.data.topicName === topicName
						);
					}
				)
				.pipe(
					tap((message) => {
						if (message.data.transactionStatus) {
							this._handleTransaction(message.data.transactionStatus);
						}
					})
				);
		})
	);
}
