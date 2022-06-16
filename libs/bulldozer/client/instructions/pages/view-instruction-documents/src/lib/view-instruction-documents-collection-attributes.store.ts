import { Injectable } from '@angular/core';
import { CollectionAttributesStore } from '@bulldozer-client/collections-data-access';
import {
	HdBroadcasterSocketStore,
	TransactionStatus,
} from '@heavy-duty/broadcaster';
import {
	CollectionAttribute,
	Document,
	flattenInstructions,
	InstructionStatus,
} from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined, isTruthy } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { TransactionSignature } from '@solana/web3.js';
import { List } from 'immutable';
import { EMPTY, merge, switchMap, tap } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { reduceInstructions } from './reduce-account-collection-attributes-instructions';
import { CollectionAttributeItemView } from './types';

const documentToView = (
	document: Document<CollectionAttribute>
): CollectionAttributeItemView => {
	return {
		id: document.id,
		name: document.name,
		isCreating: false,
		isUpdating: false,
		isDeleting: false,
		kind: document.data.kind,
		modifier: document.data.modifier,
		collectionId: document.data.collection,
		applicationId: document.data.application,
		workspaceId: document.data.workspace,
	};
};

interface ViewModel {
	applicationId: string | null;
	transactions: List<TransactionStatus>;
}

const initialState: ViewModel = {
	applicationId: null,
	transactions: List(),
};

@Injectable()
export class ViewInstructionDocumentsCollectionAttributesStore extends ComponentStore<ViewModel> {
	private readonly _applicationId$ = this.select(
		({ applicationId }) => applicationId
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
		this._collectionAttributesStore.collectionAttributes$,
		this._instructionStatuses$,
		(collectionAttributes, instructionStatuses) => {
			if (collectionAttributes === null) {
				return null;
			}

			return instructionStatuses.reduce(
				reduceInstructions,
				collectionAttributes.map(documentToView)
			);
		},
		{ debounce: true }
	);

	constructor(
		private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
		private readonly _collectionAttributesStore: CollectionAttributesStore
	) {
		super(initialState);

		this._collectionAttributesStore.setFilters(
			this.select(
				this._applicationId$.pipe(isNotNullOrUndefined),
				this._hdBroadcasterSocketStore.connected$.pipe(isTruthy),
				(applicationId) => ({ application: applicationId })
			)
		);
		this._registerTopics(
			this.select(
				this._hdBroadcasterSocketStore.connected$,
				this._collectionAttributesStore.collectionAttributeIds$,
				(connected, collectionAttributeIds) => ({
					connected,
					topicNames:
						collectionAttributeIds?.map(
							(collectionAttributeId) =>
								`collectionAttributes:${collectionAttributeId}`
						) ?? List(),
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

	readonly setApplicationId = this.updater<string | null>(
		(state, applicationId) => ({
			...state,
			applicationId,
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

	private readonly _registerTopics = this.effect<{
		connected: boolean;
		topicNames: List<string> | null;
	}>(
		switchMap(({ connected, topicNames }) => {
			if (!connected || topicNames === null) {
				return EMPTY;
			}

			this.patchState({ transactions: List() });

			return merge(
				...topicNames.map((topicName) => {
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
		})
	);
}
