import { Component } from '@angular/core';
import { DrillApiService } from '../services/drill-api.service';
import { NotificationService } from '../services/notification.service';
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
			class="bp-bg-metal bg-black p-4 flex gap-4 mx-auto mt-10 rounded"
			style="max-width: 900px"
		>
			<div class="flex flex-col gap-4 flex-1" *ngrxLet="issue$; let issue">
				<drill-bounty-information
					[loading]="(loadingIssue$ | ngrxPush) ?? true"
					[exists]="issue !== null"
					[bountyId]="issue?.number ?? null"
					[htmlUrl]="issue?.html_url ?? null"
					[body]="issue?.body ?? null"
					[title]="issue?.title ?? null"
				>
				</drill-bounty-information>

				<drill-bounty-user
					[loading]="(loadingIssue$ | ngrxPush) ?? true"
					[exists]="issue !== null"
					[avatarUrl]="issue?.user?.avatar_url ?? null"
					[userName]="issue?.user?.login ?? null"
					[htmlUrl]="issue?.user?.html_url ?? null"
				>
				</drill-bounty-user>

				<drill-bounty-user
					*ngIf="issue?.assignee !== undefined"
					[loading]="(loadingIssue$ | ngrxPush) ?? true"
					[exists]="true"
					[avatarUrl]="issue?.assignee?.avatar_url ?? null"
					[userName]="issue?.assignee?.login ?? null"
					[htmlUrl]="issue?.assignee?.html_url ?? null"
					type="hunter"
				>
				</drill-bounty-user>
			</div>

			<div class="flex flex-col gap-4 w-2/5">
				<drill-bounty-total
					*ngrxLet="bountyTotal$; let bountyTotal"
					[loading]="(loadingTotal$ | ngrxPush) ?? true"
					[exists]="bountyTotal !== null"
					[total]="bountyTotal"
				>
				</drill-bounty-total>

				<drill-bounty-claim
					*ngrxLet="bounty$; let bounty"
					[exists]="bounty !== null"
					[loading]="(loadingBounty$ | ngrxPush) ?? true"
					[boardId]="bounty?.boardId ?? null"
					[bountyId]="bounty?.id ?? null"
					(claimBounty)="onClaimBounty($event.boardId, $event.bountyId)"
				>
				</drill-bounty-claim>

				<drill-bounty-status
					*ngrxLet="bounty$; let bounty"
					[exists]="bounty !== null"
					[loading]="(loadingBounty$ | ngrxPush) ?? true"
					[isClosed]="bounty?.isClosed ?? null"
				>
				</drill-bounty-status>
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
	readonly bounty$ = this._bountyStore.bounty$;
	readonly issue$ = this._issueStore.issue$;
	readonly loadingIssue$ = this._issueStore.loading$;
	readonly bountyVault$ = this._bountyStore.bountyVault$;
	readonly boardMint$ = this._boardMintStore.boardMint$;
	readonly bountyTotal$ = this._bountyPageStore.bountyTotal$;
	readonly loadingTotal$ = this._bountyPageStore.loadingTotal$;
	readonly loadingBounty$ = this._bountyStore.loading$;

	constructor(
		private readonly _issueStore: IssueStore,
		private readonly _bountyStore: BountyStore,
		private readonly _boardMintStore: BoardMintStore,
		private readonly _drillApiService: DrillApiService,
		private readonly _bountyPageStore: BountyPageStore,
		private readonly _notificationService: NotificationService
	) {}

	onClaimBounty(boardId: number, bountyId: number) {
		this._drillApiService.claimBounty(boardId, bountyId).subscribe({
			next: () => this._notificationService.notifySuccess('Bounty Claimed!!!'),
			error: (error) => this._notificationService.notifyError(error),
		});
	}
}
