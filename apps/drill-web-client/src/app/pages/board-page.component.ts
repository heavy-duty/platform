import { Component } from '@angular/core';
import { PublicKey } from '@solana/web3.js';
import { DrillApiService } from '../services/drill-api.service';
import { NotificationService } from '../services/notification.service';
import { BoardMintStore } from '../stores/board-mint.store';
import { BoardStore } from '../stores/board.store';
import { BountiesStore } from '../stores/bounties.store';
import { IssuesStore } from '../stores/issues.store';
import { RepositoryStore } from '../stores/repository.store';
import { BoardPageStore, BountyViewModel } from './board-page.store';

@Component({
	selector: 'drill-board-page',
	template: `
		<ng-container *ngIf="(loading$ | ngrxPush) === false; else loadingTemplate">
			<ng-container *ngrxLet="bounties$; let bounties">
				<section
					*ngIf="
						bounties !== null && bounties.length > 0;
						else emptyBoardTemplate
					"
				>
					<article
						*ngFor="let bounty of bounties; trackBy: trackBy"
						class="bp-bg-metal bg-black p-4 flex gap-4 mx-auto mt-10 rounded"
						style="max-width: 900px"
					>
						<div class="flex flex-col gap-4 flex-1">
							<drill-bounty-information
								[exists]="true"
								[loading]="false"
								[bountyId]="bounty.bounty?.id ?? null"
								[htmlUrl]="bounty.htmlUrl"
								[body]="bounty.body"
								[title]="bounty.title"
							>
							</drill-bounty-information>

							<drill-bounty-user
								[loading]="false"
								[exists]="true"
								[avatarUrl]="bounty.creator.avatarUrl"
								[userName]="bounty.creator.login"
								[htmlUrl]="bounty.creator.htmlUrl"
							>
							</drill-bounty-user>

							<drill-bounty-user
								*ngIf="bounty.hunter !== null"
								[loading]="false"
								[exists]="true"
								[avatarUrl]="bounty.hunter.avatarUrl"
								[userName]="bounty.hunter.login"
								[htmlUrl]="bounty.hunter.htmlUrl"
								type="hunter"
							>
							</drill-bounty-user>
						</div>

						<div class="flex flex-col gap-4 w-2/5">
							<drill-bounty-total
								[loading]="false"
								[exists]="true"
								[total]="bounty.bounty?.uiAmount ?? null"
							>
							</drill-bounty-total>

							<drill-bounty-claim
								[loading]="false"
								[exists]="true"
								[boardId]="bounty.bounty?.boardId ?? null"
								[bountyId]="bounty.bounty?.id ?? null"
								(claimBounty)="
									onClaimBounty(
										$event.boardId,
										$event.bountyId,
										$event.userVault
									)
								"
							>
							</drill-bounty-claim>

							<drill-bounty-status
								[loading]="false"
								[exists]="true"
								[isClosed]="bounty.bounty?.isClosed ?? null"
							>
							</drill-bounty-status>
						</div>
					</article>
				</section>
			</ng-container>
		</ng-container>

		<ng-template #emptyBoardTemplate>
			<section class="py-8">
				<p class="text-center text-xl">
					There's no bounties available at this time.
				</p>
			</section>
		</ng-template>

		<ng-template #loadingTemplate>
			<section class="flex justify-center items-center gap-4 py-8">
				<span
					class="inline-block h-8 w-8 border-4 border-accent"
					drillProgressSpinner
				></span>
				<p>Loading...</p>
			</section>
		</ng-template>
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
	readonly loading$ = this._boardPageStore.loading$;

	constructor(
		private readonly _drillApiService: DrillApiService,
		private readonly _boardPageStore: BoardPageStore,
		private readonly _notificationService: NotificationService
	) {}

	trackBy(_: number, bounty: BountyViewModel): number {
		return bounty.id;
	}

	onClaimBounty(boardId: number, bountyId: number, userVault: PublicKey) {
		this._drillApiService.claimBounty(boardId, bountyId, userVault).subscribe({
			next: () => this._notificationService.notifySuccess('Bounty Claimed!!!'),
			error: (error) => this._notificationService.notifyError(error),
		});
	}
}
