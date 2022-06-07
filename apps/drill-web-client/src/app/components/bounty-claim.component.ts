import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Mint } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { Option } from '../types';

@Component({
	selector: 'drill-bounty-claim',
	template: `
		<drill-screwed-card class="bg-black px-6 py-4 rounded">
			<ng-container *ngIf="!loading; else loadingTemplate">
				<ng-container *ngIf="exists; else notFoundTemplate">
					<button
						class="bg-black h-full w-full py-2 bp-button uppercase"
						[acceptedMint]="acceptedMint?.address ?? null"
						[disabled]="boardId === null || bountyId === null"
						(claimBounty)="onClaimBounty(boardId, bountyId, $event)"
						drillBountyClaimTrigger
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
	@Input() acceptedMint: Option<Mint> = null;
	@Input() loading = false;
	@Input() exists = false;
	@Output() claimBounty = new EventEmitter<{
		boardId: number;
		bountyId: number;
		userVault: PublicKey;
	}>();

	onClaimBounty(
		boardId: Option<number>,
		bountyId: Option<number>,
		userVault: PublicKey
	) {
		if (boardId === null || bountyId === null) {
			throw new Error('Missing fields');
		}

		this.claimBounty.emit({ boardId, bountyId, userVault });
	}
}
