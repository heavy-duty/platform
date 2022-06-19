import { Component, Input } from '@angular/core';
import {
	CollectionApiService,
	CollectionQueryStore,
	CollectionsStore,
} from '@bulldozer-client/collections-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { CollectionDto } from '@heavy-duty/bulldozer-devkit';
import { Keypair } from '@solana/web3.js';
import { CollectionExplorerStore } from './collection-explorer.store';
import { CollectionItemView } from './types';

@Component({
	selector: 'bd-collection-explorer',
	template: `
		<mat-expansion-panel togglePosition="before">
			<mat-expansion-panel-header class="pl-6 pr-0">
				<div class="flex justify-between items-center flex-grow">
					<mat-panel-title class="font-bold"> Collections </mat-panel-title>

					<ng-container
						*hdWalletAdapter="
							let publicKey = publicKey;
							let connected = connected
						"
					>
						<ng-container *ngIf="workspaceId$ | ngrxPush as workspaceId">
							<ng-container *ngIf="applicationId$ | ngrxPush as applicationId">
								<button
									*ngIf="
										publicKey !== null &&
										workspaceId !== null &&
										applicationId !== null
									"
									[disabled]="!connected"
									[disabled]="disableCreate"
									(editCollection)="
										onCreateCollection(
											publicKey.toBase58(),
											workspaceId,
											applicationId,
											$event
										)
									"
									mat-icon-button
									aria-label="Create collection"
									bdStopPropagation
									bdEditCollection
								>
									<mat-icon>add</mat-icon>
								</button>
							</ng-container>
						</ng-container>
					</ng-container>
				</div>
			</mat-expansion-panel-header>
			<mat-nav-list dense>
				<mat-list-item
					*ngFor="let collection of collections$ | ngrxPush; trackBy: identify"
					class="pr-0"
				>
					<a
						class="w-full flex justify-between gap-2 items-center flex-grow m-0 pl-0"
						[routerLink]="[
							'/workspaces',
							collection.workspaceId,
							'applications',
							collection.applicationId,
							'collections',
							collection.id
						]"
						[matTooltip]="
							collection.name | bdItemUpdatingMessage: collection:'Collection'
						"
						matLine
						matTooltipShowDelay="500"
					>
						<span
							class="pl-12 flex-grow text-left overflow-hidden whitespace-nowrap overflow-ellipsis"
						>
							{{ collection.name }}
						</span>

						<span
							*ngIf="collection | bdItemChanging"
							class="flex-shrink-0 h-4 w-4 border-4 border-accent"
							hdProgressSpinner
						></span>
					</a>

					<ng-container
						*hdWalletAdapter="
							let publicKey = publicKey;
							let connected = connected
						"
					>
						<ng-container *ngIf="publicKey !== null">
							<button
								[attr.aria-label]="
									'More options of ' + collection.name + ' collection'
								"
								[matMenuTriggerFor]="collectionOptionsMenu"
								mat-icon-button
							>
								<mat-icon>more_horiz</mat-icon>
							</button>
							<mat-menu
								#collectionOptionsMenu="matMenu"
								class="bg-bp-wood bg-bp-brown"
							>
								<button
									[collection]="collection"
									[disabled]="!connected || (collection | bdItemChanging)"
									(editCollection)="
										onUpdateCollection(
											publicKey.toBase58(),
											collection.workspaceId,
											collection.applicationId,
											collection.id,
											$event
										)
									"
									mat-menu-item
									bdEditCollection
								>
									<mat-icon>edit</mat-icon>
									<span>Edit collection</span>
								</button>
								<button
									[disabled]="!connected || (collection | bdItemChanging)"
									(click)="
										onDeleteCollection(
											publicKey.toBase58(),
											collection.workspaceId,
											collection.applicationId,
											collection.id
										)
									"
									mat-menu-item
								>
									<mat-icon>delete</mat-icon>
									<span>Delete collection</span>
								</button>
							</mat-menu>
						</ng-container>
					</ng-container>
				</mat-list-item>
			</mat-nav-list>
		</mat-expansion-panel>
	`,
	providers: [CollectionsStore, CollectionQueryStore, CollectionExplorerStore],
})
export class CollectionExplorerComponent {
	@Input() disableCreate = false;
	@Input() set workspaceId(value: string) {
		this._collectionExplorerStore.setWorkspaceId(value);
	}
	@Input() set applicationId(value: string) {
		this._collectionExplorerStore.setApplicationId(value);
	}

	readonly workspaceId$ = this._collectionExplorerStore.workspaceId$;
	readonly applicationId$ = this._collectionExplorerStore.applicationId$;
	readonly collections$ = this._collectionExplorerStore.collections$;

	constructor(
		private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
		private readonly _notificationStore: NotificationStore,
		private readonly _collectionApiService: CollectionApiService,
		private readonly _collectionExplorerStore: CollectionExplorerStore
	) {}

	onCreateCollection(
		authority: string,
		workspaceId: string,
		applicationId: string,
		collectionDto: CollectionDto
	) {
		const collectionKeypair = Keypair.generate();

		this._collectionApiService
			.create(collectionKeypair, {
				authority,
				workspaceId,
				applicationId,
				collectionDto,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Create collection request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`applications:${applicationId}:collections`,
									`collections:${collectionKeypair.publicKey.toBase58()}`,
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

	onUpdateCollection(
		authority: string,
		workspaceId: string,
		applicationId: string,
		collectionId: string,
		collectionDto: CollectionDto
	) {
		this._collectionApiService
			.update({
				authority,
				workspaceId,
				applicationId,
				collectionDto,
				collectionId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Update collection request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`applications:${applicationId}:collections`,
									`collections:${collectionId}`,
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

	onDeleteCollection(
		authority: string,
		workspaceId: string,
		applicationId: string,
		collectionId: string
	) {
		this._collectionApiService
			.delete({
				authority,
				workspaceId,
				applicationId,
				collectionId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Delete collection request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`applications:${applicationId}:collections`,
									`collections:${collectionId}`,
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

	identify(_: number, collection: CollectionItemView) {
		return collection.id;
	}
}
