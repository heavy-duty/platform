import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
	InstructionArgumentApiService,
	InstructionArgumentsStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { InstructionArgumentDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { distinctUntilChanged, map } from 'rxjs';
import { InstructionArgumentItemView } from './types';
import { ViewInstructionArgumentsStore } from './view-instruction-arguments.store';

@Component({
	selector: 'bd-view-instruction-arguments',
	template: `
		<header class="mb-8">
			<div>
				<h1 class="text-4xl uppercase mb-1 bp-font">Arguments</h1>
				<p class="text-sm font-thin mb-0">
					The arguments are the input parameters of your instruction.
				</p>
				<ng-container *hdWalletAdapter="let publicKey = publicKey">
					<ng-container *ngrxLet="workspaceId$; let workspaceId">
						<ng-container *ngrxLet="applicationId$; let applicationId">
							<ng-container *ngrxLet="instructionId$; let instructionId">
								<button
									*ngIf="
										publicKey !== null &&
										workspaceId !== null &&
										applicationId !== null &&
										instructionId !== null
									"
									class="underline text-accent"
									(editInstructionArgument)="
										onCreateInstructionArgument(
											publicKey.toBase58(),
											workspaceId,
											applicationId,
											instructionId,
											$event
										)
									"
									bdEditInstructionArgument
								>
									New argument
								</button>
							</ng-container>
						</ng-container>
					</ng-container>
				</ng-container>
			</div>
		</header>

		<main>
			<ng-container
				*hdBroadcasterStatus="let connected = connected; let online = online"
			>
				<ng-container *ngIf="online; else offline">
					<ng-container *ngIf="connected; else disconnected">
						<ng-container
							*ngIf="(loading$ | ngrxPush) === false; else loadingData"
						>
							<ng-container
								*ngrxLet="instructionArguments$; let instructionArguments"
							>
								<section
									*ngIf="
										instructionArguments && instructionArguments.size > 0;
										else emptyList
									"
									class="flex gap-6 flex-wrap"
								>
									<div
										*ngFor="
											let instructionArgument of instructionArguments;
											let i = index;
											trackBy: identify
										"
										class="flex flex-col gap-2 bg-bp-metal bg-black px-4 py-5 rounded mat-elevation-z8"
									>
										<bd-card class="flex-1 flex gap-2 justify-between">
											<figure
												*ngIf="!(instructionArgument | bdItemChanging)"
												class="w-16 h-16 flex justify-center items-center bg-bp-black rounded-full"
											>
												<img
													alt=""
													width="40"
													height="40"
													src="assets/icons/instruction-argument.svg"
													onerror="this.src='assets/images/default-profile.png';"
												/>
											</figure>

											<div
												*ngIf="instructionArgument | bdItemChanging"
												class="flex justify-center items-center w-16 h-16 rounded-full overflow-hidden bg-bp-black"
											>
												<span
													class="h-8 w-8 border-4 border-accent"
													hdProgressSpinner
												></span>

												<p
													class="m-0 text-xs text-white text-opacity-60 absolute"
												>
													<ng-container *ngIf="instructionArgument.isCreating">
														Creating
													</ng-container>
													<ng-container *ngIf="instructionArgument.isUpdating">
														Updating
													</ng-container>
													<ng-container *ngIf="instructionArgument.isDeleting">
														Deleting
													</ng-container>
												</p>
											</div>

											<div class="flex gap-10 mt-1">
												<section>
													<p
														class="mb-0 text-lg font-bold overflow-hidden whitespace-nowrap overflow-ellipsis"
														[matTooltip]="
															instructionArgument.name
																| bdItemUpdatingMessage
																	: instructionArgument
																	: 'Argument'
														"
														matTooltipShowDelay="500"
													>
														{{ instructionArgument.name }}
													</p>
													<p class="text-sm mb-0">
														{{ instructionArgument.kind.name }}.
													</p>
												</section>
												<section class="flex flex-col gap-1">
													<p class="text-sm font-thin m-0">
														<mat-icon inline>auto_awesome_motion</mat-icon>
														&nbsp;
														<ng-container
															*ngIf="instructionArgument.modifier !== null"
															[ngSwitch]="instructionArgument.modifier.id"
														>
															<ng-container *ngSwitchCase="0">
																Array of Items
															</ng-container>
															<ng-container *ngSwitchCase="1">
																Vector of Items
															</ng-container>
														</ng-container>

														<ng-container
															*ngIf="instructionArgument.modifier === null"
														>
															Single Item
														</ng-container>
													</p>
													<p
														*ngIf="
															instructionArgument.modifier !== null &&
															instructionArgument.modifier.size
														"
														class="text-sm font-thin m-0"
													>
														<mat-icon inline="">data_array</mat-icon>
														&nbsp; Size:
														{{ instructionArgument.modifier?.size }}
													</p>
												</section>
											</div>
										</bd-card>
										<bd-card
											*hdWalletAdapter="
												let publicKey = publicKey;
												let connected = connected
											"
											class="flex"
										>
											<button
												*ngIf="publicKey !== null"
												class="bp-button flex-1"
												[attr.aria-label]="
													'Update argument ' + instructionArgument.name
												"
												[instructionArgument]="{
													name: instructionArgument.name,
													kind: instructionArgument.kind.id,
													max:
														instructionArgument.kind.id === 1
															? instructionArgument.kind.size
															: null,
													maxLength: instructionArgument.kind.size,
													modifier: instructionArgument.modifier?.id ?? null,
													size: instructionArgument.modifier?.size ?? null
												}"
												[disabled]="
													!connected || (instructionArgument | bdItemChanging)
												"
												(editInstructionArgument)="
													onUpdateInstructionArgument(
														publicKey.toBase58(),
														instructionArgument.workspaceId,
														instructionArgument.instructionId,
														instructionArgument.id,
														$event
													)
												"
												bdEditInstructionArgument
											>
												Edit
											</button>
											<button
												*ngIf="publicKey !== null"
												class="bp-button flex-1"
												[attr.aria-label]="
													'Delete argument ' + instructionArgument.name
												"
												[disabled]="
													!connected || (instructionArgument | bdItemChanging)
												"
												(click)="
													onDeleteInstructionArgument(
														publicKey.toBase58(),
														instructionArgument.workspaceId,
														instructionArgument.instructionId,
														instructionArgument.id
													)
												"
											>
												Delete
											</button>
										</bd-card>
									</div>
								</section>
							</ng-container>
						</ng-container>
					</ng-container>
				</ng-container>
			</ng-container>

			<ng-template #offline>
				<div class="py-8">
					<p class="text-center text-xl">
						You're
						<span class="font-bold text-red-500">offline</span>.
					</p>
				</div>
			</ng-template>

			<ng-template #disconnected>
				<div class="py-8">
					<p class="text-center text-xl">
						You're currently
						<span class="font-bold text-red-500">disconnected</span>.
					</p>
				</div>
			</ng-template>

			<ng-template #loadingData>
				<div *ngIf="loading$ | ngrxPush" class="py-8">
					<span
						class="mx-auto mb-4 h-12 w-12 border-4 border-accent"
						hdProgressSpinner
					></span>
					<p class="text-center">Loading data...</p>
				</div>
			</ng-template>

			<ng-template #emptyList>
				<p class="text-center text-xl py-8">There's no arguments yet.</p>
			</ng-template>
		</main>
	`,
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [InstructionArgumentsStore, ViewInstructionArgumentsStore],
})
export class ViewInstructionArgumentsComponent implements OnInit {
	@HostBinding('class') class = 'block p-8 pt-5 h-full';
	readonly workspaceId$ = this._route.paramMap.pipe(
		map((paramMap) => paramMap.get('workspaceId')),
		isNotNullOrUndefined,
		distinctUntilChanged()
	);
	readonly applicationId$ = this._route.paramMap.pipe(
		map((paramMap) => paramMap.get('applicationId')),
		isNotNullOrUndefined,
		distinctUntilChanged()
	);
	readonly instructionId$ = this._route.paramMap.pipe(
		map((paramMap) => paramMap.get('instructionId')),
		isNotNullOrUndefined,
		distinctUntilChanged()
	);
	readonly loading$ = this._instructionArgumentsStore.loading$;
	readonly instructionArguments$ =
		this._viewInstructionArgumentsStore.instructionArguments$;

	constructor(
		private readonly _route: ActivatedRoute,
		private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
		private readonly _notificationStore: NotificationStore,
		private readonly _instructionArgumentApiService: InstructionArgumentApiService,
		private readonly _instructionArgumentsStore: InstructionArgumentsStore,
		private readonly _viewInstructionArgumentsStore: ViewInstructionArgumentsStore
	) {}

	ngOnInit() {
		this._viewInstructionArgumentsStore.setInstructionId(this.instructionId$);
	}

	onCreateInstructionArgument(
		authority: string,
		workspaceId: string,
		applicationId: string,
		instructionId: string,
		instructionArgumentDto: InstructionArgumentDto
	) {
		this._instructionArgumentApiService
			.create({
				instructionArgumentDto,
				authority,
				workspaceId,
				applicationId,
				instructionId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Create argument request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`instructionArguments:${instructionId}`,
								],
							},
						})
					);
				},
				error: (error) => {
					this._notificationStore.setError(error);
				},
			});
	}

	onUpdateInstructionArgument(
		authority: string,
		workspaceId: string,
		instructionId: string,
		instructionArgumentId: string,
		instructionArgumentDto: InstructionArgumentDto
	) {
		this._instructionArgumentApiService
			.update({
				authority,
				workspaceId,
				instructionId,
				instructionArgumentDto,
				instructionArgumentId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Update argument request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`instructionArguments:${instructionId}`,
								],
							},
						})
					);
				},
				error: (error) => this._notificationStore.setError(error),
			});
	}

	onDeleteInstructionArgument(
		authority: string,
		workspaceId: string,
		instructionId: string,
		instructionArgumentId: string
	) {
		this._instructionArgumentApiService
			.delete({
				authority,
				workspaceId,
				instructionArgumentId,
				instructionId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Delete argument request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`instructionArguments:${instructionId}`,
								],
							},
						})
					);
				},
				error: (error) => this._notificationStore.setError(error),
			});
	}

	identify(_: number, instructionArgument: InstructionArgumentItemView) {
		return instructionArgument.id;
	}
}
