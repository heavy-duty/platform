import { Component, Output } from '@angular/core';
import { filter } from 'rxjs';
import { isNotNull } from '../utils';
import { BlockhashStatusSectionStore } from './blockhash-status-section.store';

@Component({
	selector: 'crane-blockhash-status-section',
	template: `
		<ng-container *ngrxLet="lastValidBlockHeight$; let lastValidBlockHeight">
			<crane-screwed-card
				class="mt-4 bg-black bp-bg-metal-2 px-6 py-4 rounded flex justify-between items-center"
				*ngrxLet="percentage$; let percentage"
			>
				<header>
					<h2>Blockhash Status</h2>

					<p
						*ngIf="percentage !== null && lastValidBlockHeight !== null"
						class="text-xs"
						[ngClass]="{
							'text-green-500': percentage >= 50,
							'text-yellow-500': percentage >= 20 && percentage < 50,
							'text-orange-500': percentage > 0 && percentage < 20,
							'text-red-500': percentage === 0
						}"
					>
						<ng-container *ngIf="percentage >= 50">
							Blockhash is valid.
						</ng-container>
						<ng-container *ngIf="percentage > 0 && percentage < 50">
							Blockhash is expiring.
						</ng-container>
						<ng-container *ngIf="percentage === 0">
							Blockhash expired.
						</ng-container>
						<button
							(click)="onBlockhashRestarted()"
							class="underline text-gray-400"
							style="font-size: 0.5rem"
						>
							(Reload)
						</button>
					</p>
					<p
						*ngIf="lastValidBlockHeight === null"
						class="text-xs text-gray-400"
					>
						Empty blockhash.
					</p>
				</header>

				<ng-container
					*ngIf="lastValidBlockHeight !== null && percentage !== null"
				>
					<div *ngIf="percentage > 0" class="-scale-x-100">
						<mat-progress-spinner
							diameter="24"
							color="primary"
							mode="determinate"
							[value]="percentage"
						>
						</mat-progress-spinner>
					</div>

					<mat-icon *ngIf="percentage === 0" class="text-red-500 leading-none">
						cancel
					</mat-icon>
				</ng-container>
			</crane-screwed-card>
		</ng-container>
	`,
	providers: [BlockhashStatusSectionStore],
})
export class BlockhashStatusSectionComponent {
	readonly percentage$ = this._blockhashStatusSectionStore.percentage$;
	readonly isValid$ = this._blockhashStatusSectionStore.isValid$;
	readonly lastValidBlockHeight$ =
		this._blockhashStatusSectionStore.lastValidBlockHeight$;

	@Output() blockhashExpired =
		this._blockhashStatusSectionStore.serviceState$.pipe(
			isNotNull,
			filter(
				(state) => state.matches('Blockhash invalid') && state.changed === true
			)
		);
	@Output() blockhashChanged =
		this._blockhashStatusSectionStore.latestBlockhash$.pipe(isNotNull);

	constructor(
		private readonly _blockhashStatusSectionStore: BlockhashStatusSectionStore
	) {}

	loadBlockhash() {
		this._blockhashStatusSectionStore.getBlockHeight();
	}

	onBlockhashRestarted() {
		this.loadBlockhash();
	}
}
