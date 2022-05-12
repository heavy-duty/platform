import { Component } from '@angular/core';
import { DrillApiService } from '../services/drill-api.service';
import { BoardMintStore } from '../stores/board-mint.store';
import { BoardStore } from '../stores/board.store';
import { BountiesStore } from '../stores/bounties.store';
import { IssuesStore } from '../stores/issues.store';
import { RepositoryStore } from '../stores/repository.store';
import { BoardPageStore, BountyViewModel } from './board-page.store';

@Component({
	selector: 'drill-board-page',
	template: `
		<ng-container *ngIf="bounties$ | async as bounties">
			<section *ngIf="bounties.length > 0; else emptyBoard">
				<article
					*ngFor="let bounty of bounties; trackBy: trackBy"
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
								<img
									class="w-8 h-8 rounded-full"
									[src]="bounty.hunter.avatarUrl"
								/>

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

						<drill-screwed-card
							class="px-6 py-4"
							*ngIf="bounty.bounty !== null"
						>
							<button
								class="bg-black h-full w-full py-2 bd-button"
								(click)="onClaimBounty(bounty.bounty.boardId, bounty.bounty.id)"
							>
								CLAIM
							</button>
						</drill-screwed-card>
					</div>
				</article>
			</section>

			<ng-template #emptyBoard>
				<section class="py-4">
					<p class="text-center text-xl">
						There's no bounties available at this time.
					</p>
				</section>
			</ng-template>
		</ng-container>
	`,
	providers: [
		RepositoryStore,
		IssuesStore,
		BoardStore,
		BoardMintStore,
		BountiesStore,
		BoardPageStore,
	],
})
export class BoardPageComponent {
	readonly bounties$ = this._boardPageStore.bounties$;

	constructor(
		private readonly _drillApiService: DrillApiService,
		private readonly _boardPageStore: BoardPageStore
	) {}

	trackBy(_: number, bounty: BountyViewModel): number {
		return bounty.id;
	}

	onClaimBounty(boardId: number, bountyId: number) {
		this._drillApiService.claimBounty(boardId, bountyId).subscribe();
	}
}
