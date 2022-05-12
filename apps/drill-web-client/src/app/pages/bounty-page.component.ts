import { Component } from '@angular/core';
import { DrillApiService } from '../services/drill-api.service';
import { BoardMintStore } from '../stores/board-mint.store';
import { BoardStore } from '../stores/board.store';
import { BountyStore } from '../stores/bounty.store';
import { IssueStore } from '../stores/issue.store';
import { RepositoryStore } from '../stores/repository.store';
import { BountyPageStore } from './bounty-page.store';

@Component({
	selector: 'drill-bounty-page',
	template: `
		<div
			*ngIf="bounty$ | async as bounty"
			class="bp-bg-metal bg-black p-4 flex gap-4 mx-auto mt-10 rounded"
			style="max-width: 900px"
		>
			<div class="flex flex-col gap-4 flex-1">
				<drill-screwed-card class="p-6 rounded">
					<h2 class="text-2xl">{{ bounty.title }}</h2>
					<p
						class="h-16"
						[ngClass]="{ 'italic text-gray-400': bounty.body === null }"
					>
						<ng-container *ngIf="bounty.body !== null; else noneBody">
							{{ bounty.body }}
						</ng-container>
						<ng-template #noneBody> No description provided. </ng-template>
					</p>

					<div class="flex gap-4">
						<a
							*ngIf="bounty.bounty !== null"
							[routerLink]="['/bounty', bounty.bounty.id]"
							class="underline"
						>
							View details
						</a>
						<a [href]="bounty.htmlUrl" class="underline">View in GitHub</a>
					</div>
				</drill-screwed-card>

				<drill-screwed-card class="rounded">
					<a
						class="flex items-center gap-4 px-6 py-4"
						[href]="bounty.creator.htmlUrl"
						target="_blank"
					>
						<img
							class="w-8 h-8 rounded-full"
							[src]="bounty.creator.avatarUrl"
						/>

						<div>
							<p class="text-lg">@{{ bounty.creator.login }}</p>
							<p class="text-xs uppercase bp-color-primary">Creator</p>
						</div>
					</a>
				</drill-screwed-card>

				<drill-screwed-card *ngIf="bounty.hunter !== null" class="rounded">
					<a
						class="flex items-center gap-4 px-6 py-4"
						[href]="bounty.hunter.htmlUrl"
						target="_blank"
					>
						<img class="w-8 h-8 rounded-full" [src]="bounty.hunter.avatarUrl" />

						<div>
							<p class="text-lg">@{{ bounty.hunter.login }}</p>
							<p class="text-xs uppercase bp-color-primary">Hunter</p>
						</div>
					</a>
				</drill-screwed-card>
			</div>

			<div class="flex flex-col gap-4 w-2/5">
				<drill-screwed-card class="p-6 rounded">
					<p class="p-4 text-center text-3xl bp-font bp-color-primary">
						Bounty
					</p>

					<p class="p-4 bg-black bg-opacity-25 text-2xl text-center">
						{{ bounty.bounty?.uiAmount | number: '0.2-12' }}
					</p>
				</drill-screwed-card>

				<drill-screwed-card class="px-6 py-4" *ngIf="bounty.bounty !== null">
					<button
						class="bg-black h-full w-full py-2 bd-button uppercase"
						(click)="onClaimBounty(bounty.bounty.boardId, bounty.bounty.id)"
					>
						claim
					</button>
				</drill-screwed-card>

				<drill-screwed-card class="px-6 py-4" *ngIf="bounty.bounty !== null">
					<p
						class="text-center uppercase text-2xl bp-font text-red-500"
						[ngClass]="{
							'text-red-500': bounty.bounty.isClosed,
							'text-green-500': !bounty.bounty.isClosed
						}"
					>
						{{ bounty.bounty.isClosed ? 'closed' : 'open' }}
					</p>
				</drill-screwed-card>
			</div>
		</div>
	`,
	providers: [
		RepositoryStore,
		IssueStore,
		BoardStore,
		BoardMintStore,
		BountyStore,
		BountyPageStore,
	],
})
export class BountyPageComponent {
	readonly bounty$ = this._bountyPageStore.bounty$;

	constructor(
		private readonly _drillApiService: DrillApiService,
		private readonly _bountyPageStore: BountyPageStore
	) {}

	onClaimBounty(boardId: number, bountyId: number) {
		this._drillApiService.claimBounty(boardId, bountyId).subscribe();
	}
}
