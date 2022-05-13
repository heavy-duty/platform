import { Component, Input } from '@angular/core';
import { Option } from '../types';

@Component({
	selector: 'drill-bounty-total',
	template: `
		<drill-screwed-card class="bg-black p-6 rounded">
			<ng-container *ngIf="!loading; else loadingTemplate">
				<ng-container *ngIf="exists; else notFoundTemplate">
					<p class="p-4 text-center text-3xl bp-font bp-color-primary">
						Bounty
					</p>

					<p class="p-4 bg-black bg-opacity-25 text-2xl text-center">
						{{ total | number: '0.2-12' }}
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
			<ng-template #notFoundTemplate> <p>Bounty not found...</p> </ng-template>
		</drill-screwed-card>
	`,
})
export class BountyTotalComponent {
	@Input() total: Option<number> = null;
	@Input() loading = false;
	@Input() exists = false;
}
