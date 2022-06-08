import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
	CollectionApiService,
	CollectionStore,
} from '@bulldozer-client/collections-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { CollectionDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { combineLatest, distinctUntilChanged, map } from 'rxjs';
import { ViewCollectionStore } from './view-collection.store';

@Component({
	selector: 'bd-view-collection',
	template: `
		<ng-container *ngrxLet="collection$; let collection">
			<aside class="w-80 flex flex-col flex-shrink-0 pt-5 pb-4 px-5 ml-2">
				<header class="mb-7 w-full">
					<ng-container *ngIf="collection !== null; else notFound">
						<p class="mb-0 text-2xl uppercase bp-font">{{ collection.name }}</p>
						<p class="text-xs m-0">
							Visualize all the details about this collection.
						</p>
					</ng-container>
					<ng-template #notFound>
						<p class="mb-0 text-2xl uppercase bp-font">not found</p>
						<p class="text-xs m-0">
							The collection you're trying to visualize is not available.
						</p>
					</ng-template>
				</header>

				<ng-container *ngrxLet="workspaceId$; let workspaceId">
					<ng-container *ngrxLet="applicationId$; let applicationId">
						<ng-container *ngrxLet="collectionId$; let collectionId">
							<ul
								*ngIf="
									workspaceId !== null &&
									applicationId !== null &&
									collectionId !== null
								"
								class="flex-1 overflow-y-auto"
							>
								<li>
									<a
										class="flex flex-col gap-1 py-3 px-7 bg-bp-stone-2 mb-6 mat-elevation-z4"
										[routerLink]="[
											'/workspaces',
											workspaceId,
											'applications',
											applicationId,
											'collections',
											collectionId,
											'attributes'
										]"
										[routerLinkActive]="[
											'bp-box-shadow-bg-white',
											'border-primary'
										]"
										[ngClass]="{
											'border-transparent': !isRouteActive(
												'/workspaces/' +
													workspaceId +
													'/applications/' +
													applicationId +
													'/collections/' +
													collectionId +
													'/attributes'
											)
										}"
									>
										<span class="text-lg font-bold">Attributes</span>
										<span class="text-xs font-thin">
											Visualize the list of attributes
										</span>
									</a>
								</li>
								<li>
									<a
										class="flex flex-col gap-1 py-3 px-7 bg-bp-stone-2 m-auto mb-6 mat-elevation-z4"
										[routerLink]="[
											'/workspaces',
											workspaceId,
											'applications',
											applicationId,
											'collections',
											collectionId,
											'code-viewer'
										]"
										[routerLinkActive]="[
											'bp-box-shadow-bg-white',
											'border-primary'
										]"
										[ngClass]="{
											'border-transparent': !isRouteActive(
												'/workspaces/' +
													workspaceId +
													'/applications/' +
													applicationId +
													'/collections/' +
													collectionId +
													'/code-viewer'
											)
										}"
									>
										<span class="text-lg font-bold">Code Viewer</span>
										<span class="text-xs font-thin">
											Visualize the collection source code
										</span>
									</a>
								</li>
							</ul>
						</ng-container>
					</ng-container>
				</ng-container>

				<ng-container *hdWalletAdapter="let publicKey = publicKey">
					<footer
						*ngIf="publicKey !== null && collection !== null"
						class="w-full py-4 px-7 h-16 flex justify-center items-center m-auto bg-bp-metal-2 shadow relative"
					>
						<button
							class="bp-button w-28"
							[collection]="collection"
							[disabled]="collection | bdItemChanging"
							(editCollection)="
								onUpdateCollection(
									publicKey.toBase58(),
									collection.workspaceId,
									collection.applicationId,
									collection.id,
									$event
								)
							"
							color="accent"
							bdEditCollection
						>
							Edit
						</button>
						<button
							class="bp-button w-28"
							[disabled]="collection | bdItemChanging"
							(click)="
								onDeleteCollection(
									publicKey.toBase58(),
									collection.workspaceId,
									collection.applicationId,
									collection.id
								)
							"
							color="warn"
						>
							Delete
						</button>

						<div
							class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-7 left-2"
						>
							<div class="w-full h-px bg-gray-600 rotate-45"></div>
						</div>
						<div
							class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-7 right-2"
						>
							<div class="w-full h-px bg-gray-600"></div>
						</div>
					</footer>
				</ng-container>
			</aside>
		</ng-container>

		<figure class="w-14 mt-2">
			<img src="assets/images/pipe.webp" width="56" height="1500" alt="pipe" />
		</figure>

		<div class="flex-1 overflow-y-auto">
			<router-outlet></router-outlet>
		</div>
	`,
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [CollectionStore, ViewCollectionStore],
})
export class ViewCollectionComponent implements OnInit {
	@HostBinding('class') class = 'flex h-full';
	readonly collection$ = this._viewCollectionStore.collection$;
	readonly loading$ = this._collectionStore.loading$;
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
	readonly collectionId$ = this._route.paramMap.pipe(
		map((paramMap) => paramMap.get('collectionId')),
		isNotNullOrUndefined,
		distinctUntilChanged()
	);

	constructor(
		private readonly _router: Router,
		private readonly _route: ActivatedRoute,
		private readonly _tabStore: TabStore,
		private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
		private readonly _notificationStore: NotificationStore,
		private readonly _collectionApiService: CollectionApiService,
		private readonly _collectionStore: CollectionStore,
		private readonly _viewCollectionStore: ViewCollectionStore
	) {}

	ngOnInit() {
		this._viewCollectionStore.setCollectionId(this.collectionId$);
		this._tabStore.openTab(
			combineLatest({
				workspaceId: this.workspaceId$,
				applicationId: this.applicationId$,
				collectionId: this.collectionId$,
			}).pipe(
				map(({ collectionId, applicationId, workspaceId }) => ({
					id: collectionId,
					kind: 'collection',
					url: `/workspaces/${workspaceId}/applications/${applicationId}/collections/${collectionId}`,
				}))
			)
		);
	}

	isRouteActive(url: string) {
		return this._router.isActive(url, {
			paths: 'exact',
			queryParams: 'exact',
			fragment: 'ignored',
			matrixParams: 'ignored',
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
}
