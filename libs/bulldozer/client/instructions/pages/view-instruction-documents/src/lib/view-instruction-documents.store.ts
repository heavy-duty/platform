import { Injectable } from '@angular/core';
import { InstructionAccountsStore } from '@bulldozer-client/instructions-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { List } from 'immutable';
import { map } from 'rxjs';
import { InstructionAccountItemView } from './types';
import { ViewInstructionDocumentsAccountConstraintsStore } from './view-instruction-documents-account-constraints.store';
import { ViewInstructionDocumentsAccountsStore } from './view-instruction-documents-accounts.store';
import { ViewInstructionDocumentsClosesReferencesStore } from './view-instruction-documents-close-references.store';
import { ViewInstructionDocumentsCollectionAttributesStore } from './view-instruction-documents-collection-attributes.store';
import { ViewInstructionDocumentsCollectionsReferencesStore } from './view-instruction-documents-collections-references.store';
import { ViewInstructionDocumentsCollectionsStore } from './view-instruction-documents-collections.store';
import { ViewInstructionDocumentsDerivationsReferencesStore } from './view-instruction-documents-derivations-references.store';
import { ViewInstructionDocumentsPayersReferencesStore } from './view-instruction-documents-payers-references.store';
import { ViewInstructionDocumentsRelationsStore } from './view-instruction-documents-relations.store';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ViewModel {}

const initialState: ViewModel = {};

@Injectable()
export class ViewInstructionDocumentsStore extends ComponentStore<ViewModel> {
	readonly documents$ = this.select(
		this._viewInstructionDocumentsAccountsStore.accounts$,
		this._viewInstructionDocumentsCollectionsStore.collections$,
		this._viewInstructionDocumentsPayersReferencesStore.accounts$,
		this._viewInstructionDocumentsCollectionsReferencesStore.accounts$,
		this._viewInstructionDocumentsClosesReferencesStore.accounts$,
		this._viewInstructionDocumentsRelationsStore.accounts$,
		this._viewInstructionDocumentsDerivationsReferencesStore.accounts$,
		this._viewInstructionDocumentsCollectionAttributesStore.accounts$,
		this._viewInstructionDocumentsAccountConstraintsStore.accounts$,
		(
			instructionAccounts,
			collections,
			payers,
			collectionsReferences,
			closes,
			relations,
			derivations,
			collectionAttributes,
			constraints
		) => {
			if (
				instructionAccounts === null ||
				collections === null ||
				payers === null ||
				collectionsReferences === null ||
				closes === null ||
				relations === null ||
				collectionAttributes === null ||
				constraints === null
			) {
				return null;
			}

			return instructionAccounts
				.filter((instructionAccount) => instructionAccount.kind.id !== 1)
				.map((instructionAccount) => {
					const payerAccountId =
						payers.find((payer) => payer.id === instructionAccount.payer)
							?.payer ?? null;
					const closeAccountId =
						closes.find((close) => close.id === instructionAccount.close)
							?.close ?? null;
					const collectionId =
						collectionsReferences.find(
							(collection) => collection.id === instructionAccount.collection
						)?.collection ?? null;
					const derivation =
						derivations?.find(
							({ id }) => id === instructionAccount.derivation
						) ?? null;

					return {
						...instructionAccount,
						payer:
							instructionAccounts.find(
								(instructionAccount) => payerAccountId === instructionAccount.id
							) ?? null,
						close:
							instructionAccounts.find(
								(instructionAccount) => closeAccountId === instructionAccount.id
							) ?? null,
						collection:
							collections.find(
								(collection) => collectionId === collection.id
							) ?? null,
						derivation: {
							isUpdating: derivation?.isUpdating ?? false,
							name: derivation?.name ?? null,
							seedPaths: List(
								derivations
									?.find(({ id }) => id === instructionAccount.derivation)
									?.seedPaths.map(
										(seedPath) =>
											instructionAccounts.find(
												(instructionAccount) =>
													instructionAccount.id === seedPath
											) ?? null
									)
									.filter(
										(seedPath): seedPath is InstructionAccountItemView =>
											seedPath !== null
									) ?? []
							),
							bumpPath: derivation?.bumpPath
								? {
										reference:
											instructionAccounts.find(
												({ id }) => id === derivation.bumpPath?.reference
											) ?? null,
										path:
											collectionAttributes.find(
												({ id }) => id === derivation.bumpPath?.path
											) ?? null,
								  }
								: null,
						},
						relations: relations
							.filter((relation) => relation.from === instructionAccount.id)
							.map((relation) => {
								return {
									...relation,
									to:
										instructionAccounts.find(
											(instructionAccount) =>
												relation.to === instructionAccount.id
										) ?? null,
								};
							}),
						constraints: constraints.filter(
							(constraint) => constraint.accountId === instructionAccount.id
						),
						tokenAuthority:
							instructionAccounts.find(
								({ id }) => id === instructionAccount.tokenAuthority
							) ?? null,
						mint:
							instructionAccounts.find(
								({ id }) => id === instructionAccount.mint
							) ?? null,
					};
				});
		}
	);

	constructor(
		private readonly _viewInstructionDocumentsCollectionsStore: ViewInstructionDocumentsCollectionsStore,
		private readonly _viewInstructionDocumentsAccountsStore: ViewInstructionDocumentsAccountsStore,
		private readonly _viewInstructionDocumentsAccountConstraintsStore: ViewInstructionDocumentsAccountConstraintsStore,
		private readonly _viewInstructionDocumentsRelationsStore: ViewInstructionDocumentsRelationsStore,
		private readonly _instructionAccountsStore: InstructionAccountsStore,
		private readonly _viewInstructionDocumentsPayersReferencesStore: ViewInstructionDocumentsPayersReferencesStore,
		private readonly _viewInstructionDocumentsCollectionsReferencesStore: ViewInstructionDocumentsCollectionsReferencesStore,
		private readonly _viewInstructionDocumentsDerivationsReferencesStore: ViewInstructionDocumentsDerivationsReferencesStore,
		private readonly _viewInstructionDocumentsClosesReferencesStore: ViewInstructionDocumentsClosesReferencesStore,
		private readonly _viewInstructionDocumentsCollectionAttributesStore: ViewInstructionDocumentsCollectionAttributesStore
	) {
		super(initialState);

		this._viewInstructionDocumentsPayersReferencesStore.setInstructionAccountPayerIds(
			this._instructionAccountsStore.instructionAccounts$.pipe(
				isNotNullOrUndefined,
				map((accounts) =>
					accounts
						.filter((account) => account.data.kind.id !== 1)
						.map((account) => account.data.payer)
						.filter((payer): payer is string => payer !== null)
						.toList()
				)
			)
		);
		this._viewInstructionDocumentsCollectionsReferencesStore.setInstructionAccountCollectionIds(
			this._instructionAccountsStore.instructionAccounts$.pipe(
				isNotNullOrUndefined,
				map((accounts) =>
					accounts
						.filter((account) => account.data.kind.id !== 1)
						.map((account) => account.data.collection)
						.filter((collection): collection is string => collection !== null)
						.toList()
				)
			)
		);
		this._viewInstructionDocumentsDerivationsReferencesStore.setInstructionAccountDerivationIds(
			this._instructionAccountsStore.instructionAccounts$.pipe(
				isNotNullOrUndefined,
				map((accounts) =>
					accounts
						.filter((account) => account.data.kind.id !== 1)
						.map((account) => account.data.derivation)
						.filter((derivation): derivation is string => derivation !== null)
						.toList()
				)
			)
		);
		this._viewInstructionDocumentsClosesReferencesStore.setInstructionAccountCloseIds(
			this._instructionAccountsStore.instructionAccounts$.pipe(
				isNotNullOrUndefined,
				map((accounts) =>
					accounts
						.filter((account) => account.data.kind.id !== 1)
						.map((account) => account.data.close)
						.filter((close): close is string => close !== null)
						.toList()
				)
			)
		);
	}
}
