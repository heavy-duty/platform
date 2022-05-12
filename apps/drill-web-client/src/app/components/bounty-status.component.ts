import { Component, Input } from '@angular/core';
import { Option } from '../types';

@Component({
	selector: 'drill-bounty-status',
	template: `
		<drill-screwed-card class="bg-black px-6 py-4 rounded">
			<ng-container *ngIf="!loading; else loadingTemplate">
				<ng-container *ngIf="exists; else notFoundTemplate">
					<p
						*ngIf="isClosed !== null"
						class="text-center uppercase text-2xl bp-font text-red-500"
						[ngClass]="{
							'text-red-500': isClosed,
							'text-green-500': !isClosed
						}"
					>
						{{ isClosed ? 'closed' : 'open' }}
					</p>
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
export class BountyStatusComponent {
	@Input() isClosed: Option<boolean> = null;
	@Input() loading = false;
	@Input() exists = false;
}
