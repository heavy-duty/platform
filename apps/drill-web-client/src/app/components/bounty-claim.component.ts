import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Option } from '../types';

@Component({
	selector: 'drill-bounty-claim',
	template: `
		<drill-screwed-card class="px-6 py-4">
			<ng-container *ngIf="!loading; else loadingTemplate">
				<ng-container *ngIf="exists; else notFoundTemplate">
					<button
						class="bg-black h-full w-full py-2 bd-button uppercase"
						(click)="onClaimBounty(boardId, bountyId)"
						[disabled]="boardId === null || bountyId === null"
					>
						claim
					</button>
				</ng-container>
			</ng-container>

			<ng-template #loadingTemplate>
				<div class="flex items-center gap-4">
					<span
						class="inline-block h-8 w-8 border-4 border-accent"
						drillProgressSpinner
					></span>
					<p>Loading...</p>
				</div>
			</ng-template>
			<ng-template #notFoundTemplate>
				<p>Bounty not found...</p>
			</ng-template>
		</drill-screwed-card>
	`,
})
export class BountyClaimComponent {
	@Input() boardId: Option<number> = null;
	@Input() bountyId: Option<number> = null;
	@Input() loading = false;
	@Input() exists = false;
	@Output() claimBounty = new EventEmitter<{
		boardId: number;
		bountyId: number;
	}>();

	onClaimBounty(boardId: Option<number>, bountyId: Option<number>) {
		if (boardId === null || bountyId === null) {
			throw new Error('Missing fields');
		}

		this.claimBounty.emit({ boardId, bountyId });
	}
}
