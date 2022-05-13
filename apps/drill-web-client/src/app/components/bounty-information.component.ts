import { Component, Input } from '@angular/core';
import { Option } from '../types';

@Component({
	selector: 'drill-bounty-information',
	template: `
		<drill-screwed-card class="bg-black p-6 rounded">
			<ng-container *ngIf="!loading; else loadingTemplate">
				<ng-container *ngIf="exists; else notFoundTemplate">
					<h2 class="text-2xl">{{ title }}</h2>
					<p class="h-16" [ngClass]="{ 'italic text-gray-400': body === null }">
						<ng-container *ngIf="body !== null; else emptyBodyTemplate">
							{{ body }}
						</ng-container>
						<ng-template #emptyBodyTemplate>
							No description provided.
						</ng-template>
					</p>

					<div class="flex gap-4">
						<a [routerLink]="['/bounty', bountyId]" class="underline">
							View details
						</a>
						<a [href]="htmlUrl" class="underline">View in GitHub</a>
					</div>
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
				<p>User not found...</p>
			</ng-template>
		</drill-screwed-card>
	`,
})
export class BountyInformationComponent {
	@Input() htmlUrl: Option<string> = null;
	@Input() body: Option<string> = null;
	@Input() title: Option<string> = null;
	@Input() bountyId: Option<number> = null;
	@Input() loading = false;
	@Input() exists = false;
}
