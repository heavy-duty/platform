import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
	CollectionAttributesStore,
	CollectionQueryStore,
	CollectionsStore,
} from '@bulldozer-client/collections-data-access';
import {
	InstructionAccountApiService,
	InstructionAccountClosesStore,
	InstructionAccountCollectionsStore,
	InstructionAccountConstraintApiService,
	InstructionAccountConstraintQueryStore,
	InstructionAccountConstraintsStore,
	InstructionAccountDerivationsStore,
	InstructionAccountPayersStore,
	InstructionAccountQueryStore,
	InstructionAccountsStore,
	InstructionRelationApiService,
	InstructionRelationQueryStore,
	InstructionRelationsStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { InstructionAccountDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { Keypair } from '@solana/web3.js';
import { List } from 'immutable';
import { distinctUntilChanged, map } from 'rxjs';
import { ViewInstructionDocumentsAccountConstraintsStore } from './view-instruction-documents-account-constraints.store';
import { ViewInstructionDocumentsAccountsStore } from './view-instruction-documents-accounts.store';
import { ViewInstructionDocumentsClosesReferencesStore } from './view-instruction-documents-close-references.store';
import { ViewInstructionDocumentsCollectionAttributesStore } from './view-instruction-documents-collection-attributes.store';
import { ViewInstructionDocumentsCollectionsReferencesStore } from './view-instruction-documents-collections-references.store';
import { ViewInstructionDocumentsCollectionsStore } from './view-instruction-documents-collections.store';
import { ViewInstructionDocumentsDerivationsReferencesStore } from './view-instruction-documents-derivations-references.store';
import { ViewInstructionDocumentsPayersReferencesStore } from './view-instruction-documents-payers-references.store';
import { ViewInstructionDocumentsRelationsStore } from './view-instruction-documents-relations.store';
import { ViewInstructionDocumentsStore } from './view-instruction-documents.store';

@Component({
	selector: 'bd-view-instruction-documents',
	template: `
		<header class="mb-8 ">
			<div>
				<h1 class="text-4xl uppercase mb-1 bp-font">Documents</h1>
				<p class="text-sm font-thin mb-0">
					The documents are the entities that make up the instruction.
				</p>
			</div>

			<ng-container *hdWalletAdapter="let publicKey = publicKey">
				<ng-container *ngrxLet="workspaceId$; let workspaceId">
					<ng-container *ngrxLet="applicationId$; let applicationId">
						<ng-container *ngrxLet="instructionId$; let instructionId">
							<button
								*ngIf="
									publicKey !== null &&
									workspaceId !== null &&
									applicationId !== null &&
									instructionId !== null
								"
								class="underline text-accent"
								[collections]="(collections$ | ngrxPush) ?? null"
								[instructionAccounts]="
									(instructionAccounts$ | ngrxPush) ?? null
								"
								(editInstructionAccount)="
									onCreateInstructionDocument(
										publicKey.toBase58(),
										workspaceId,
										applicationId,
										instructionId,
										$event
									)
								"
								bdAddInstructionAccount
							>
								New document
							</button>
						</ng-container>
					</ng-container>
				</ng-container>
			</ng-container>
		</header>

		<main *ngrxLet="documents$; let documents" class="pb-20">
			<div
				*ngIf="documents && documents.size > 0; else emptyList"
				class="flex gap-6 flex-wrap"
			>
				<div
					*ngFor="
						let instructionDocument of documents;
						let i = index;
						trackBy: trackBy
					"
					class="flex flex-col gap-2 bg-bp-metal bg-black px-4 py-5 rounded mat-elevation-z8"
				>
					<div class="flex gap-2">
						<bd-card class="flex-1">
							<div class="flex items-center gap-4">
								<figure
									*ngIf="!(instructionDocument | bdItemChanging)"
									class="w-16 h-16 flex justify-center items-center bg-bp-black rounded-full"
								>
									<img
										alt=""
										width="40"
										height="40"
										src="assets/icons/instruction-document.svg"
										onerror="this.src='assets/images/default-profile.png';"
									/>
								</figure>

								<div
									*ngIf="instructionDocument | bdItemChanging"
									class="flex justify-center items-center w-16 h-16 rounded-full overflow-hidden bg-bp-black"
								>
									<span
										class="h-8 w-8 border-4 border-accent"
										hdProgressSpinner
									></span>
									<p class="m-0 text-xs text-white text-opacity-60 absolute">
										<ng-container *ngIf="instructionDocument.isCreating">
											Creating
										</ng-container>
										<ng-container *ngIf="instructionDocument.isUpdating">
											Updating
										</ng-container>
										<ng-container *ngIf="instructionDocument.isDeleting">
											Deleting
										</ng-container>
									</p>
								</div>

								<div class="flex-1 flex gap-8 justify-between">
									<div class="pr-4">
										<p
											class="mb-0 text-lg font-bold uppercase"
											[matTooltip]="
												instructionDocument.name
													| bdItemUpdatingMessage
														: instructionDocument
														: 'Document'
											"
											matTooltipShowDelay="500"
										>
											{{ instructionDocument.name }}
										</p>

										<p class="capitalize font-bold m-0">
											<ng-container
												*ngIf="instructionDocument.modifier !== null"
												[ngSwitch]="instructionDocument.modifier.id"
											>
												<ng-container *ngSwitchCase="0"> create </ng-container>
												<ng-container *ngSwitchCase="1">
													<ng-container
														*ngIf="instructionDocument.close === null"
													>
														update
													</ng-container>
													<ng-container
														*ngIf="instructionDocument.close !== null"
													>
														delete
													</ng-container>
												</ng-container>
											</ng-container>

											<ng-container
												*ngIf="instructionDocument.modifier === null"
											>
												readonly
											</ng-container>
										</p>

										<p
											*ngIf="instructionDocument.collection"
											class="text-xs mb-0"
										>
											Collection:
											<a
												class="underline text-accent"
												[routerLink]="[
													'/workspaces',
													instructionDocument.workspaceId,
													'applications',
													instructionDocument.applicationId,
													'collections',
													instructionDocument.collection.id
												]"
											>
												{{ instructionDocument.collection.name }}
											</a>
										</p>

										<p
											*ngIf="instructionDocument.kind.name !== 'document'"
											class="text-xs mb-0"
										>
											{{ instructionDocument.kind.name }}
										</p>

										<p
											*ngIf="
												instructionDocument.kind.name === 'token' &&
												instructionDocument.mint !== null
											"
											class="text-xs mb-0"
										>
											Mint:
											<span class="text-accent underline">
												{{ instructionDocument.mint.name }}
											</span>
										</p>

										<p
											*ngIf="
												instructionDocument.kind.name === 'token' &&
												instructionDocument.tokenAuthority !== null
											"
											class="text-xs mb-0"
										>
											Authority:
											<span class="text-accent underline">
												{{ instructionDocument.tokenAuthority.name }}
											</span>
										</p>
									</div>

									<div class="self-center">
										<p
											*ngIf="
												instructionDocument.modifier !== null &&
												instructionDocument.modifier.id === 0 &&
												instructionDocument.payer !== null
											"
											class="text-xs m-0 overflow-hidden whitespace-nowrap overflow-ellipsis"
										>
											Payed by:

											<br />

											<a
												class="underline text-accent"
												[routerLink]="[
													'/workspaces',
													instructionDocument.workspaceId,
													'applications',
													instructionDocument.applicationId,
													'instructions',
													instructionDocument.instructionId,
													instructionDocument.payer.kind.id === 0
														? 'documents'
														: 'signers'
												]"
												>{{ instructionDocument.payer?.name }}</a
											>

											<br />

											({{ instructionDocument.space }} bytes)
										</p>

										<p
											*ngIf="
												instructionDocument.modifier !== null &&
												instructionDocument.modifier.id === 1 &&
												instructionDocument.close !== null
											"
											class="text-xs m-0 overflow-hidden whitespace-nowrap overflow-ellipsis"
										>
											Rent sent to:

											<br />

											<a
												class="underline text-accent"
												[routerLink]="[
													'/workspaces',
													instructionDocument.workspaceId,
													'applications',
													instructionDocument.applicationId,
													'instructions',
													instructionDocument.instructionId,
													instructionDocument.kind.id === 0
														? 'documents'
														: 'signers'
												]"
											>
												{{ instructionDocument.close.name }}
											</a>
										</p>
									</div>
								</div>
							</div>
						</bd-card>
						<bd-card class="flex flex-col justify-center">
							<ng-container *hdWalletAdapter="let publicKey = publicKey">
								<ng-container
									*ngrxLet="instructionAccounts$; let instructionAccounts"
								>
									<ng-container *ngrxLet="collections$; let collections">
										<ng-container
											*ngIf="
												instructionAccounts !== null &&
												collections !== null &&
												publicKey !== null
											"
										>
											<ng-container [ngSwitch]="instructionDocument.kind.name">
												<button
													*ngSwitchCase="'document'"
													class="bp-button w-28"
													[collections]="(collections$ | ngrxPush) ?? null"
													[instructionAccounts]="
														instructionAccounts
															| bdRemoveById: instructionDocument.id
													"
													[instructionDocument]="{
														name: instructionDocument.name,
														kind: instructionDocument.kind.id,
														space: instructionDocument.space,
														payer: instructionDocument.payer?.id ?? null,
														collection:
															instructionDocument.collection?.id ?? null,
														modifier: instructionDocument.modifier?.id ?? null,
														close: instructionDocument.close?.id ?? null,
														uncheckedExplanation:
															instructionDocument.uncheckedExplanation ?? null,
														mint: instructionDocument.mint?.id ?? null,
														tokenAuthority:
															instructionDocument.tokenAuthority?.id ?? null
													}"
													[disabled]="instructionDocument | bdItemChanging"
													[attr.aria-label]="
														'Update document ' + instructionDocument.name
													"
													(editInstructionDocument)="
														onUpdateInstructionDocument(
															publicKey.toBase58(),
															instructionDocument.workspaceId,
															instructionDocument.applicationId,
															instructionDocument.instructionId,
															instructionDocument.id,
															$event
														)
													"
													bdEditInstructionDocument
												>
													Edit
												</button>

												<button
													*ngSwitchCase="'unchecked'"
													class="bp-button w-28"
													[instructionAccounts]="
														instructionAccounts
															| bdRemoveById: instructionDocument.id
													"
													[instructionDocument]="{
														name: instructionDocument.name,
														kind: instructionDocument.kind.id,
														space: instructionDocument.space,
														payer: instructionDocument.payer?.id ?? null,
														collection:
															instructionDocument.collection?.id ?? null,
														modifier: instructionDocument.modifier?.id ?? null,
														close: instructionDocument.close?.id ?? null,
														uncheckedExplanation:
															instructionDocument.uncheckedExplanation ?? null,
														mint: instructionDocument.mint?.id ?? null,
														tokenAuthority:
															instructionDocument.tokenAuthority?.id ?? null
													}"
													[disabled]="instructionDocument | bdItemChanging"
													[attr.aria-label]="
														'Update unchecked ' + instructionDocument.name
													"
													(editInstructionUnchecked)="
														onUpdateInstructionDocument(
															publicKey.toBase58(),
															instructionDocument.workspaceId,
															instructionDocument.applicationId,
															instructionDocument.instructionId,
															instructionDocument.id,
															$event
														)
													"
													bdEditInstructionUnchecked
												>
													Edit
												</button>

												<button
													*ngSwitchCase="'token'"
													class="bp-button w-28"
													[instructionAccounts]="
														instructionAccounts
															| bdRemoveById: instructionDocument.id
													"
													[instructionDocument]="{
														name: instructionDocument.name,
														kind: instructionDocument.kind.id,
														space: instructionDocument.space,
														payer: instructionDocument.payer?.id ?? null,
														collection:
															instructionDocument.collection?.id ?? null,
														modifier: instructionDocument.modifier?.id ?? null,
														close: instructionDocument.close?.id ?? null,
														uncheckedExplanation:
															instructionDocument.uncheckedExplanation ?? null,
														mint: instructionDocument.mint?.id ?? null,
														tokenAuthority:
															instructionDocument.tokenAuthority?.id ?? null
													}"
													[disabled]="instructionDocument | bdItemChanging"
													[attr.aria-label]="
														'Update token ' + instructionDocument.name
													"
													(editInstructionToken)="
														onUpdateInstructionDocument(
															publicKey.toBase58(),
															instructionDocument.workspaceId,
															instructionDocument.applicationId,
															instructionDocument.instructionId,
															instructionDocument.id,
															$event
														)
													"
													bdEditInstructionToken
												>
													Edit
												</button>

												<button
													*ngSwitchCase="'mint'"
													class="bp-button w-28"
													[instructionDocument]="{
														name: instructionDocument.name,
														kind: instructionDocument.kind.id,
														space: instructionDocument.space,
														payer: instructionDocument.payer?.id ?? null,
														collection:
															instructionDocument.collection?.id ?? null,
														modifier: instructionDocument.modifier?.id ?? null,
														close: instructionDocument.close?.id ?? null,
														uncheckedExplanation:
															instructionDocument.uncheckedExplanation ?? null,
														mint: instructionDocument.mint?.id ?? null,
														tokenAuthority:
															instructionDocument.tokenAuthority?.id ?? null
													}"
													[disabled]="instructionDocument | bdItemChanging"
													[attr.aria-label]="
														'Update mint ' + instructionDocument.name
													"
													(editInstructionMint)="
														onUpdateInstructionDocument(
															publicKey.toBase58(),
															instructionDocument.workspaceId,
															instructionDocument.applicationId,
															instructionDocument.instructionId,
															instructionDocument.id,
															$event
														)
													"
													bdEditInstructionMint
												>
													Edit
												</button>
											</ng-container>

											<button
												class="bp-button w-28"
												[attr.aria-label]="
													'Delete document ' + instructionDocument.name
												"
												[disabled]="instructionDocument | bdItemChanging"
												(click)="
													onDeleteInstructionDocument(
														publicKey.toBase58(),
														instructionDocument.workspaceId,
														instructionDocument.instructionId,
														instructionDocument.id
													)
												"
											>
												Delete
											</button>
										</ng-container>
									</ng-container>
								</ng-container>
							</ng-container>
						</bd-card>
					</div>

					<bd-card>
						<section
							*hdWalletAdapter="let publicKey = publicKey"
							class="flex flex-col gap-2"
						>
							<div class="flex justify-between items-center">
								<p class="uppercase m-0">Constraints</p>

								<button
									class="bp-button"
									(editInstructionAccountConstraint)="
										onCreateInstructionAccountConstraint(
											publicKey?.toBase58() ?? null,
											instructionDocument.workspaceId,
											instructionDocument.applicationId,
											instructionDocument.instructionId,
											instructionDocument.id,
											$event
										)
									"
									bdEditInstructionAccountConstraint
								>
									Add

									<mat-icon inline>add</mat-icon>
								</button>
							</div>

							<article
								*ngFor="let constraint of instructionDocument.constraints"
							>
								<div class="flex justify-between items-center">
									<p class="m-0">{{ constraint.name }}</p>
									<div class="flex">
										<button
											class="bp-button"
											[disabled]="
												constraint.isCreating ||
												constraint.isUpdating ||
												constraint.isDeleting
											"
											[instructionAccountConstraint]="constraint"
											(editInstructionAccountConstraint)="
												onUpdateInstructionAccountConstraint(
													publicKey?.toBase58() ?? null,
													instructionDocument.workspaceId,
													instructionDocument.applicationId,
													instructionDocument.instructionId,
													instructionDocument.id,
													constraint.id,
													$event
												)
											"
											bdEditInstructionAccountConstraint
										>
											Edit

											<mat-icon inline>edit</mat-icon>
										</button>
										<button
											class="bp-button text-red-500"
											[disabled]="
												constraint.isCreating || constraint.isDeleting
											"
											(click)="
												onDeleteInstructionAccountConstraint(
													publicKey?.toBase58() ?? null,
													instructionDocument.workspaceId,
													instructionDocument.applicationId,
													instructionDocument.instructionId,
													instructionDocument.id,
													constraint.id
												)
											"
										>
											Delete

											<mat-icon inline>delete</mat-icon>
										</button>
									</div>
								</div>

								<p class="p-2 bg-black bg-opacity-40 rounded-md">
									{{ constraint.body }}
								</p>
							</article>
						</section>
					</bd-card>

					<bd-card>
						<section *hdWalletAdapter="let publicKey = publicKey">
							<div class="flex justify-start items-center">
								<p class="uppercase m-0">relations</p>

								<ng-container
									*ngrxLet="instructionAccounts$; let instructionAccounts"
								>
									<button
										*ngIf="publicKey !== null && instructionAccounts !== null"
										[instructionAccounts]="
											instructionAccounts | bdRemoveById: instructionDocument.id
										"
										[from]="instructionDocument.id"
										(editInstructionRelation)="
											onCreateInstructionRelation(
												publicKey.toBase58(),
												instructionDocument.workspaceId,
												instructionDocument.applicationId,
												instructionDocument.instructionId,
												$event.from,
												$event.to
											)
										"
										aria-label="Add relation to document"
										mat-icon-button
										bdEditInstructionRelation
									>
										<mat-icon class="text-base -mt-1">add</mat-icon>
									</button>
								</ng-container>
							</div>

							<div class="flex justify-start flex-wrap gap-4">
								<div
									*ngFor="let relation of instructionDocument.relations"
									class="relative"
								>
									<div
										*ngIf="relation.to !== null"
										class="flex justify-between items-center gap-2 bg-bp-black bg-opacity-40 border border-bp-black rounded px-4 py-2"
									>
										<div class="w-48">
											<p
												class="uppercase font-bold m-0 overflow-hidden whitespace-nowrap overflow-ellipsis text-base"
												[matTooltip]="
													relation.to.name
														| bdItemUpdatingMessage: relation:'Relation to'
												"
											>
												{{ relation.to.name }}
											</p>

											<p class="text-xs font-thin m-0">
												({{ relation.id | obscureAddress }})
											</p>
										</div>

										<button
											*ngIf="publicKey !== null"
											class="bp-button w-24"
											[attr.aria-label]="
												'Delete relation to ' + relation.to.name
											"
											[disabled]="relation | bdItemChanging"
											(click)="
												onDeleteInstructionRelation(
													publicKey.toBase58(),
													relation.workspaceId,
													relation.instructionId,
													relation.from,
													relation.to.id
												)
											"
										>
											Delete
										</button>
									</div>
								</div>
							</div>
						</section>
					</bd-card>

					<bd-card>
						<section
							*hdWalletAdapter="let publicKey = publicKey"
							class="flex flex-col gap-2"
						>
							<div class="flex justify-between items-center">
								<p class="uppercase m-0">
									Derivation

									<span
										*ngIf="
											instructionDocument.derivation.name === null &&
											instructionDocument.derivation.bumpPath === null &&
											instructionDocument.derivation.seedPaths.size === 0
										"
										class="text-xs lowercase italic"
									>
										(not enabled)
									</span>
								</p>

								<ng-container
									*ngrxLet="instructionAccounts$; let instructionAccounts"
								>
									<button
										class="bp-button"
										[derivation]="instructionDocument.derivation"
										[collections]="(collections$ | ngrxPush) ?? null"
										[collectionAttributes]="
											(collectionAttributes$ | ngrxPush) ?? null
										"
										[instructionAccounts]="instructionAccounts"
										[instructionDocument]="null"
										[instructionAccountsCollectionsLookup]="
											(instructionAccountsCollectionsLookup$ | ngrxPush) ?? null
										"
										[disabled]="instructionDocument | bdItemChanging"
										[attr.aria-label]="
											'Update document ' +
											instructionDocument.name +
											' derivation'
										"
										[disabled]="
											publicKey === null ||
											instructionDocument.derivation.isUpdating
										"
										(editInstructionDocumentDerivation)="
											onUpdateInstructionDocumentDerivation(
												publicKey?.toBase58() ?? null,
												instructionDocument.workspaceId,
												instructionDocument.applicationId,
												instructionDocument.instructionId,
												instructionDocument.id,
												$event.name,
												$event.seedPaths,
												$event.bumpPath
											)
										"
										bdEditInstructionDocumentDerivation
									>
										configure

										<mat-icon inline>settings</mat-icon>
									</button>
								</ng-container>
							</div>

							<p
								*ngIf="
									instructionDocument.derivation.name !== null ||
									instructionDocument.derivation.bumpPath !== null ||
									instructionDocument.derivation.seedPaths.size !== 0
								"
								class="p-2 bg-black bg-opacity-40 rounded-md"
							>
								"{{ instructionDocument.derivation.name }}"
								<span
									*ngFor="
										let seedPath of instructionDocument.derivation.seedPaths
									"
								>
									/
									<span class="italic text-primary">{{ seedPath?.name }}</span>
								</span>
							</p>

							<p
								*ngIf="
									instructionDocument.derivation.name !== null ||
									instructionDocument.derivation.bumpPath !== null ||
									instructionDocument.derivation.seedPaths.size !== 0
								"
								class="text-xs m-0"
							>
								Bump:

								<span
									*ngIf="instructionDocument.derivation.bumpPath === null"
									class="text-primary"
								>
									Calculated.
								</span>
								<span *ngIf="instructionDocument.derivation.bumpPath !== null">
									Document
									<span class="text-primary">
										{{
											instructionDocument.derivation.bumpPath.reference?.name
										}} </span
									>, attribute
									<span class="text-primary">
										{{ instructionDocument.derivation.bumpPath.path?.name }}.
									</span>
								</span>
							</p>
						</section>
					</bd-card>
				</div>
			</div>

			<ng-template #emptyList>
				<p class="text-center text-xl py-8">There's no documents yet.</p>
			</ng-template>
		</main>
	`,
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		InstructionAccountsStore,
		InstructionAccountPayersStore,
		InstructionAccountClosesStore,
		InstructionAccountCollectionsStore,
		InstructionAccountQueryStore,
		InstructionRelationsStore,
		InstructionRelationQueryStore,
		InstructionAccountConstraintsStore,
		InstructionAccountConstraintQueryStore,
		InstructionAccountDerivationsStore,
		CollectionsStore,
		CollectionAttributesStore,
		CollectionQueryStore,
		ViewInstructionDocumentsStore,
		ViewInstructionDocumentsCollectionsStore,
		ViewInstructionDocumentsAccountsStore,
		ViewInstructionDocumentsPayersReferencesStore,
		ViewInstructionDocumentsClosesReferencesStore,
		ViewInstructionDocumentsCollectionsReferencesStore,
		ViewInstructionDocumentsDerivationsReferencesStore,
		ViewInstructionDocumentsRelationsStore,
		ViewInstructionDocumentsAccountConstraintsStore,
		ViewInstructionDocumentsCollectionAttributesStore,
	],
})
export class ViewInstructionDocumentsComponent implements OnInit {
	@HostBinding('class') class = 'block p-8 pt-5 h-full';
	instructionBody: string | null = null;
	readonly collections$ =
		this._viewInstructionDocumentsCollectionsStore.collections$.pipe(
			map(
				(collections) =>
					collections?.filter(
						(collection) => !collection.isCreating && !collection.isDeleting
					) ?? null
			)
		);
	readonly collectionAttributes$ =
		this._viewInstructionDocumentsCollectionAttributesStore.accounts$.pipe(
			map(
				(collectionAttributes) =>
					collectionAttributes?.filter(
						(collectionAttribute) =>
							!collectionAttribute.isCreating && !collectionAttribute.isDeleting
					) ?? null
			)
		);
	readonly instructionAccounts$ =
		this._viewInstructionDocumentsAccountsStore.accounts$.pipe(
			map(
				(accounts) =>
					accounts?.filter(
						(account) => !account.isCreating && !account.isDeleting
					) ?? null
			)
		);
	readonly instructionAccountsCollectionsLookup$ =
		this._viewInstructionDocumentsCollectionsReferencesStore.accounts$;

	readonly documents$ = this._viewInstructionDocumentsStore.documents$;
	readonly workspaceId$ = this._route.paramMap.pipe(
		map((paramMap) => paramMap.get('workspaceId')),
		isNotNullOrUndefined,
		distinctUntilChanged()
	);
	readonly applicationId$ = this._route.paramMap.pipe(
		map((paramMap) => paramMap.get('applicationId')),
		isNotNullOrUndefined,
		distinctUntilChanged()
	);
	readonly instructionId$ = this._route.paramMap.pipe(
		map((paramMap) => paramMap.get('instructionId')),
		isNotNullOrUndefined,
		distinctUntilChanged()
	);

	constructor(
		private readonly _route: ActivatedRoute,
		private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
		private readonly _notificationStore: NotificationStore,
		private readonly _instructionAccountApiService: InstructionAccountApiService,
		private readonly _instructionAccountConstraintApiService: InstructionAccountConstraintApiService,
		private readonly _instructionRelationApiService: InstructionRelationApiService,
		private readonly _viewInstructionDocumentsStore: ViewInstructionDocumentsStore,
		private readonly _viewInstructionDocumentsAccountsStore: ViewInstructionDocumentsAccountsStore,
		private readonly _viewInstructionDocumentsAccountConstraintsStore: ViewInstructionDocumentsAccountConstraintsStore,
		private readonly _viewInstructionDocumentsRelationsStore: ViewInstructionDocumentsRelationsStore,
		private readonly _viewInstructionDocumentsCollectionsStore: ViewInstructionDocumentsCollectionsStore,
		private readonly _viewInstructionDocumentsPayersReferencesStore: ViewInstructionDocumentsPayersReferencesStore,
		private readonly _viewInstructionDocumentsCollectionsReferencesStore: ViewInstructionDocumentsCollectionsReferencesStore,
		private readonly _viewInstructionDocumentsDerivationsReferencesStore: ViewInstructionDocumentsDerivationsReferencesStore,
		private readonly _viewInstructionDocumentsClosesReferencesStore: ViewInstructionDocumentsClosesReferencesStore,
		private readonly _viewInstructionDocumentsCollectionAttributesStore: ViewInstructionDocumentsCollectionAttributesStore
	) {}

	ngOnInit() {
		this._viewInstructionDocumentsAccountsStore.setInstructionId(
			this.instructionId$
		);
		this._viewInstructionDocumentsAccountConstraintsStore.setInstructionId(
			this.instructionId$
		);
		this._viewInstructionDocumentsRelationsStore.setInstructionId(
			this.instructionId$
		);
		this._viewInstructionDocumentsPayersReferencesStore.setInstructionId(
			this.instructionId$
		);
		this._viewInstructionDocumentsCollectionsReferencesStore.setInstructionId(
			this.instructionId$
		);
		this._viewInstructionDocumentsDerivationsReferencesStore.setInstructionId(
			this.instructionId$
		);
		this._viewInstructionDocumentsClosesReferencesStore.setInstructionId(
			this.instructionId$
		);
		this._viewInstructionDocumentsCollectionsStore.setApplicationId(
			this.applicationId$
		);
		this._viewInstructionDocumentsCollectionAttributesStore.setApplicationId(
			this.applicationId$
		);
	}

	onCreateInstructionDocument(
		authority: string,
		workspaceId: string,
		applicationId: string,
		instructionId: string,
		instructionAccountDto: InstructionAccountDto
	) {
		const instructionAccountKeypair = Keypair.generate();

		this._instructionAccountApiService
			.create(instructionAccountKeypair, {
				instructionAccountDto,
				authority,
				workspaceId,
				applicationId,
				instructionId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Create document request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`instructions:${instructionId}:accounts`,
								],
							},
						})
					);
				},
				error: (error) => {
					this._notificationStore.setError(error);
				},
			});
	}

	onUpdateInstructionDocument(
		authority: string,
		workspaceId: string,
		applicationId: string,
		instructionId: string,
		instructionAccountId: string,
		instructionAccountDto: InstructionAccountDto
	) {
		this._instructionAccountApiService
			.update({
				authority,
				workspaceId,
				applicationId,
				instructionId,
				instructionAccountDto,
				instructionAccountId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Update document request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`instructions:${instructionId}:accounts`,
								],
							},
						})
					);
				},
				error: (error) => {
					this._notificationStore.setError(error);
				},
			});
	}

	onUpdateInstructionDocumentDerivation(
		authority: string | null,
		workspaceId: string,
		applicationId: string,
		instructionId: string,
		instructionAccountId: string,
		name: string | null,
		seedPaths: List<string>,
		bumpPath: {
			collectionId: string;
			referenceId: string;
			pathId: string;
		} | null
	) {
		if (authority === null) {
			throw new Error('Connect your wallet to update derivation.');
		}

		this._instructionAccountApiService
			.updateDerivation({
				authority,
				workspaceId,
				applicationId,
				instructionId,
				instructionAccountId,
				name,
				bumpPath,
				seedPaths,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent(
						'Update document derivation request sent'
					);
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`instructions:${instructionId}:accounts`,
								],
							},
						})
					);
				},
				error: (error) => {
					this._notificationStore.setError(error);
				},
			});
	}

	onDeleteInstructionDocument(
		authority: string,
		workspaceId: string,
		instructionId: string,
		instructionAccountId: string
	) {
		this._instructionAccountApiService
			.delete({
				authority,
				workspaceId,
				instructionAccountId,
				instructionId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Delete document request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`instructions:${instructionId}:accounts`,
								],
							},
						})
					);
				},
				error: (error) => {
					this._notificationStore.setError(error);
				},
			});
	}

	onCreateInstructionRelation(
		authority: string,
		workspaceId: string,
		applicationId: string,
		instructionId: string,
		fromAccountId: string,
		toAccountId: string
	) {
		this._instructionRelationApiService
			.create({
				fromAccountId,
				toAccountId,
				authority,
				workspaceId,
				applicationId,
				instructionId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Create relation request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`instructions:${instructionId}:accounts`,
								],
							},
						})
					);
				},
				error: (error) => {
					this._notificationStore.setError(error);
				},
			});
	}

	onDeleteInstructionRelation(
		authority: string,
		workspaceId: string,
		instructionId: string,
		fromAccountId: string,
		toAccountId: string
	) {
		this._instructionRelationApiService
			.delete({
				authority,
				workspaceId,
				instructionId,
				fromAccountId,
				toAccountId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Delete relation request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`instructions:${instructionId}:accounts`,
								],
							},
						})
					);
				},
				error: (error) => {
					this._notificationStore.setError(error);
				},
			});
	}

	onCreateInstructionAccountConstraint(
		authority: string | null,
		workspaceId: string,
		applicationId: string,
		instructionId: string,
		instructionAccountId: string,
		{ name, body }: { name: string; body: string }
	) {
		if (authority === null) {
			throw new Error('Connect your wallet to create constraint.');
		}

		this._instructionAccountConstraintApiService
			.create(Keypair.generate(), {
				authority,
				workspaceId,
				applicationId,
				instructionId,
				instructionAccountId,
				name,
				body,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent(
						'Instruction account constraint request sent'
					);
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`instructions:${instructionId}:accounts`,
								],
							},
						})
					);
				},
				error: (error) => {
					this._notificationStore.setError(error);
				},
			});
	}

	onUpdateInstructionAccountConstraint(
		authority: string | null,
		workspaceId: string,
		applicationId: string,
		instructionId: string,
		instructionAccountId: string,
		instructionAccountConstraintId: string,
		{ name, body }: { name: string; body: string }
	) {
		if (authority === null) {
			throw new Error('Connect your wallet to update constraint.');
		}

		this._instructionAccountConstraintApiService
			.update({
				authority,
				workspaceId,
				applicationId,
				instructionId,
				instructionAccountId,
				instructionAccountConstraintId,
				name,
				body,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent(
						'Instruction account constraint request sent'
					);
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`instructions:${instructionId}:accounts`,
								],
							},
						})
					);
				},
				error: (error) => {
					this._notificationStore.setError(error);
				},
			});
	}

	onDeleteInstructionAccountConstraint(
		authority: string | null,
		workspaceId: string,
		applicationId: string,
		instructionId: string,
		instructionAccountId: string,
		instructionAccountConstraintId: string
	) {
		if (authority === null) {
			throw new Error('Connect your wallet to delete constraint.');
		}

		this._instructionAccountConstraintApiService
			.delete({
				authority,
				workspaceId,
				applicationId,
				instructionId,
				instructionAccountId,
				instructionAccountConstraintId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent(
						'Instruction account constraint request sent'
					);
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`instructions:${instructionId}:accounts`,
								],
							},
						})
					);
				},
				error: (error) => {
					this._notificationStore.setError(error);
				},
			});
	}

	trackBy(_: number, item: { id: string }): string {
		return item.id;
	}
}
