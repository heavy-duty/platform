import { Component, Input } from '@angular/core';
import { Option } from '../types';

@Component({
	selector: 'drill-bounty-user',
	template: `
		<drill-screwed-card class="bg-black rounded">
			<ng-container *ngIf="!loading; else loadingTemplate">
				<ng-container *ngIf="exists; else notFoundTemplate">
					<a
						class="flex items-center gap-4 px-6 py-4"
						[href]="htmlUrl"
						target="_blank"
					>
						<img class="w-8 h-8 rounded-full" [src]="avatarUrl" />

						<div>
							<p class="text-lg">@{{ userName }}</p>
							<p class="text-xs uppercase bp-color-primary">{{ type }}</p>
						</div>
					</a>
				</ng-container>
			</ng-container>

			<ng-template #loadingTemplate>
				<div class="flex items-center gap-4 px-6 py-4">
					<span
						class="inline-block h-8 w-8 border-4 border-accent"
						drillProgressSpinner
					></span>
					<p>Loading...</p>
				</div>
			</ng-template>
			<ng-template #notFoundTemplate
				><p class="px-6 py-4">User not found...</p>
			</ng-template>
		</drill-screwed-card>
	`,
})
export class BountyUserComponent {
	@Input() htmlUrl: Option<string> = null;
	@Input() avatarUrl: Option<string> = null;
	@Input() userName: Option<string> = null;
	@Input() type = 'creator';
	@Input() loading = false;
	@Input() exists = false;
}
