import { Component, HostBinding, Input } from '@angular/core';
import { CollectionStore } from '@bulldozer-client/collections-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { ViewCollectionStore } from './view-collection.store';

@Component({
	selector: 'bd-view-collection-tab',
	template: `
		<div
			*ngIf="collectionId$ | ngrxPush as collectionId"
			class="flex items-center p-0"
		>
			<div
				*ngIf="(loading$ | ngrxPush) === false; else loading"
				class="w-40 h-12 flex items-center"
			>
				<a
					class="w-full h-full flex justify-between gap-2 items-center pl-4 flex-grow"
					[routerLink]="url"
				>
					<ng-container
						*ngIf="collection$ | ngrxPush as collection; else notFound"
					>
						<span
							class="flex-grow text-left overflow-hidden whitespace-nowrap overflow-ellipsis"
							[matTooltip]="
								collection.name | bdItemUpdatingMessage: collection:'Collection'
							"
							matTooltipShowDelay="500"
						>
							{{ collection.name }}
						</span>

						<span
							*ngIf="collection | bdItemChanging"
							class="flex-shrink-0 h-4 w-4 border-4 border-accent"
							hdProgressSpinner
						></span>
					</ng-container>

					<ng-template #notFound>
						<span class="m-0 pl-4">Not found</span>
					</ng-template>
				</a>
			</div>

			<ng-template #loading>
				<p class="w-full h-1/2 m-0 bg-white bg-opacity-10 animate-pulse"></p>
			</ng-template>

			<button
				[attr.aria-label]="'Close ' + collectionId + ' tab'"
				(click)="onCloseTab(collectionId)"
				mat-icon-button
			>
				<mat-icon>close</mat-icon>
			</button>
		</div>
	`,
	providers: [CollectionStore, ViewCollectionStore],
})
export class ViewCollectionTabComponent {
	@HostBinding('class') class = 'block w-full';

	@Input() url: string | null = null;
	@Input() set collectionId(value: string) {
		this._viewCollectionStore.setCollectionId(value);
	}

	readonly collectionId$ = this._viewCollectionStore.collectionId$;
	readonly collection$ = this._viewCollectionStore.collection$;
	readonly loading$ = this._collectionStore.loading$;

	constructor(
		private readonly _tabStore: TabStore,
		private readonly _collectionStore: CollectionStore,
		private readonly _viewCollectionStore: ViewCollectionStore
	) {}

	onCloseTab(collectionId: string) {
		this._tabStore.closeTab(collectionId);
	}
}
