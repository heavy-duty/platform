import { Component, Input } from '@angular/core';
import { interval, map, startWith } from 'rxjs';

@Component({
	selector: 'bd-user-instructions-button',
	template: `
		<ng-container
			*bdUserInstructionsStore="
				let instructionStatuses = instructionStatuses;
				let instructionNotViewedStatuses = instructionNotViewedStatuses;
				let instructionInProcessStatuses = instructionInProcessStatuses;
				let markAsViewed = markAsViewed
			"
		>
			<ng-container
				*ngIf="
					instructionNotViewedStatuses !== null &&
					instructionInProcessStatuses !== null &&
					markAsViewed
				"
			>
				<div
					*ngIf="
						instructionNotViewedStatuses.size === 0 ||
						instructionInProcessStatuses.size > 0
					"
					class="inline-block relative"
				>
					<button
						class="relative"
						class="z-10"
						[matMenuTriggerFor]="menu"
						(menuClosed)="markAsViewed()"
						type="button"
						aria-label="View app notifications"
						mat-icon-button
					>
						<mat-icon>notifications</mat-icon>

						<div
							*ngIf="instructionInProcessStatuses.size > 0"
							class="absolute z-10 top-2.5 right-2.5"
						>
							<hd-progress-ping
								class="w-2.5 h-2.5 bg-red-500"
							></hd-progress-ping>
						</div>
					</button>
				</div>

				<button
					*ngIf="
						instructionNotViewedStatuses.size > 0 &&
						instructionInProcessStatuses.size === 0
					"
					class="rounded-full w-8 h-8 border-2 border-green-500"
					[matMenuTriggerFor]="menu"
					(menuClosed)="markAsViewed()"
					type="button"
				>
					{{ instructionNotViewedStatuses.size }}
				</button>
			</ng-container>

			<mat-menu #menu="matMenu" class="bg-bp-wood bg-bp-brown">
				<div class="w-80 h-auto px-4 py-2 flex flex-col gap-2 ">
					<header class="py-2">
						<h1 class="m-0 text-lg text-center font-bold">Instructions</h1>
					</header>

					<main>
						<ul
							*ngIf="
								instructionNotViewedStatuses &&
									instructionNotViewedStatuses.size > 0;
								else emptyInstructions
							"
						>
							<li
								*ngFor="let instructionStatus of instructionNotViewedStatuses"
								class="w-full h-8 flex items-center gap-4"
							>
								<div
									*ngIf="
										instructionStatus.transactionStatus.status !== 'finalized'
									"
									class="h-4 w-4 border-4 border-accent"
									hdProgressSpinner
								></div>

								<mat-icon
									*ngIf="
										instructionStatus.transactionStatus.status === 'finalized'
									"
									class="inline-block h-4 w-4 text-green-500"
									inline
									>check_circle</mat-icon
								>

								<p
									class="flex-1 m-0 overflow-hidden whitespace-nowrap overflow-ellipsis"
									[matTooltip]="instructionStatus.title"
									matTooltipShowDelay="500"
								>
									{{ instructionStatus.title }}
								</p>

								<ng-container *ngrxLet="timeNow$; let timeNow">
									<p
										*ngIf="
											instructionStatus.transactionStatus.timestamp !==
											undefined
										"
										class="text-xs m-0 text-white text-opacity-50"
									>
										{{
											timeNow - instructionStatus.transactionStatus.timestamp
												| bdRelativeTime: true
										}}
									</p>
								</ng-container>
							</li>
						</ul>

						<ng-template #emptyInstructions>
							<p class="text-center m-0">There's no pending instructions.</p>
						</ng-template>
					</main>

					<footer class="py-2 flex justify-center">
						<button class="underline text-accent" bdUserInstructionsBottomSheet>
							See more
						</button>
					</footer>
				</div>
			</mat-menu>
		</ng-container>
	`,
})
export class UserInstructionsButtonComponent {
	@Input() color = 'primary';
	readonly timeNow$ = interval(60 * 1000).pipe(
		startWith(Date.now()),
		map(() => Date.now())
	);
}
