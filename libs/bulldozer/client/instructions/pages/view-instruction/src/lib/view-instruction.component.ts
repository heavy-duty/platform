import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TabStore } from '@bulldozer-client/core-data-access';
import {
	InstructionApiService,
	InstructionStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { InstructionDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { combineLatest, distinctUntilChanged, map } from 'rxjs';
import { ViewInstructionStore } from './view-instruction.store';

@Component({
	selector: 'bd-view-instruction',
	template: `
		<ng-container *ngrxLet="instruction$; let instruction">
			<aside class="w-80 flex flex-col flex-shrink-0 pt-5 pb-4 px-5 ml-2">
				<header class="mb-7 w-full">
					<ng-container *ngIf="instruction !== null; else notFound">
						<p class="mb-0 text-2xl uppercase bp-font">
							{{ instruction.name }}
						</p>
						<p class="text-xs m-0">
							Visualize all the details about this instruction.
						</p>
					</ng-container>
					<ng-template #notFound>
						<p class="mb-0 text-2xl uppercase bp-font">not found</p>
						<p class="text-xs m-0">
							The instruction you're trying to visualize is not available.
						</p>
					</ng-template>
				</header>

				<ng-container *ngrxLet="workspaceId$; let workspaceId">
					<ng-container *ngrxLet="applicationId$; let applicationId">
						<ng-container *ngrxLet="instructionId$; let instructionId">
							<ul
								*ngIf="
									workspaceId !== null &&
									applicationId !== null &&
									instructionId !== null
								"
								class="flex-1 overflow-y-auto"
							>
								<li>
									<a
										class="flex flex-col gap-1 py-3 px-7 bg-bp-stone-2 mb-6 mat-elevation-z4"
										[routerLink]="[
											'/workspaces',
											workspaceId,
											'applications',
											applicationId,
											'instructions',
											instructionId,
											'arguments'
										]"
										[routerLinkActive]="[
											'bp-box-shadow-bg-white',
											'border-primary'
										]"
										[ngClass]="{
											'border-transparent': !isRouteActive(
												'/workspaces/' +
													workspaceId +
													'/applications/' +
													applicationId +
													'/instructions/' +
													instructionId +
													'/arguments'
											)
										}"
									>
										<span class="text-lg font-bold">Arguments</span>
										<span class="text-xs font-thin">
											Visualize the list of arguments.
										</span>
									</a>
								</li>
								<li>
									<a
										class="flex flex-col gap-1 py-3 px-7 bg-bp-stone-2 mb-6 mat-elevation-z4"
										[routerLink]="[
											'/workspaces',
											workspaceId,
											'applications',
											applicationId,
											'instructions',
											instructionId,
											'documents'
										]"
										[routerLinkActive]="[
											'bp-box-shadow-bg-white',
											'border-primary'
										]"
										[ngClass]="{
											'border-transparent': !isRouteActive(
												'/workspaces/' +
													workspaceId +
													'/applications/' +
													applicationId +
													'/instructions/' +
													instructionId +
													'/documents'
											)
										}"
									>
										<span class="text-lg font-bold">Documents</span>
										<span class="text-xs font-thin">
											Visualize the list of documents.
										</span>
									</a>
								</li>
								<li>
									<a
										class="flex flex-col gap-1 py-3 px-7 bg-bp-stone-2 mb-6 mat-elevation-z4"
										[routerLink]="[
											'/workspaces',
											workspaceId,
											'applications',
											applicationId,
											'instructions',
											instructionId,
											'signers'
										]"
										[routerLinkActive]="[
											'bp-box-shadow-bg-white',
											'border-primary'
										]"
										[ngClass]="{
											'border-transparent': !isRouteActive(
												'/workspaces/' +
													workspaceId +
													'/applications/' +
													applicationId +
													'/instructions/' +
													instructionId +
													'/signers'
											)
										}"
									>
										<span class="text-lg font-bold">Signers</span>
										<span class="text-xs font-thin">
											Visualize the list of signers.
										</span>
									</a>
								</li>
								<li>
									<a
										class="flex flex-col gap-1 py-3 px-7 bg-bp-stone-2 mb-6 mat-elevation-z4"
										[routerLink]="[
											'/workspaces',
											workspaceId,
											'applications',
											applicationId,
											'instructions',
											instructionId,
											'code-editor'
										]"
										[routerLinkActive]="[
											'bp-box-shadow-bg-white',
											'border-primary'
										]"
										[ngClass]="{
											'border-transparent': !isRouteActive(
												'/workspaces/' +
													workspaceId +
													'/applications/' +
													applicationId +
													'/instructions/' +
													instructionId +
													'/code-editor'
											)
										}"
									>
										<span class="text-lg font-bold">Code Editor</span>
										<span class="text-xs font-thin">
											Edit instruction code.
										</span>
									</a>
								</li>
							</ul>
						</ng-container>
					</ng-container>
				</ng-container>

				<ng-container
					*hdWalletAdapter="
						let publicKey = publicKey;
						let connected = connected
					"
				>
					<footer
						*ngIf="publicKey !== null && instruction !== null"
						class="w-full py-4 px-7 h-16 flex justify-center items-center m-auto bg-bp-metal-2 shadow relative"
					>
						<ng-container>
							<button
								class="bp-button w-28"
								[instruction]="instruction"
								[disabled]="!connected || (instruction | bdItemChanging)"
								(editInstruction)="
									onUpdateInstruction(
										publicKey.toBase58(),
										instruction.workspaceId,
										instruction.applicationId,
										instruction.id,
										$event
									)
								"
								bdEditInstruction
							>
								Edit
							</button>
							<button
								class="bp-button w-28"
								[disabled]="!connected || (instruction | bdItemChanging)"
								(click)="
									onDeleteInstruction(
										publicKey.toBase58(),
										instruction.workspaceId,
										instruction.applicationId,
										instruction.id
									)
								"
							>
								Delete
							</button>
							<div
								class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-7 left-2"
							>
								<div class="w-full h-px bg-gray-600 rotate-45"></div>
							</div>
							<div
								class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-7 right-2"
							>
								<div class="w-full h-px bg-gray-600"></div>
							</div>
						</ng-container>
					</footer>
				</ng-container>
			</aside>
		</ng-container>

		<figure class="w-14 mt-2">
			<img src="assets/images/pipe.webp" width="56" height="1500" alt="pipe" />
		</figure>

		<div class="flex-1 overflow-y-auto">
			<router-outlet></router-outlet>
		</div>
	`,
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [InstructionStore, ViewInstructionStore],
})
export class ViewInstructionComponent implements OnInit {
	@HostBinding('class') class = 'flex h-full';
	readonly instruction$ = this._viewInstructionStore.instruction$;
	readonly loading$ = this._instructionStore.loading$;
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

	constructor(
		private readonly _router: Router,
		private readonly _route: ActivatedRoute,
		private readonly _tabStore: TabStore,
		private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
		private readonly _notificationStore: NotificationStore,
		private readonly _instructionApiService: InstructionApiService,
		private readonly _instructionStore: InstructionStore,
		private readonly _viewInstructionStore: ViewInstructionStore
	) {}

	ngOnInit() {
		this._viewInstructionStore.setInstructionId(this.instructionId$);
		this._tabStore.openTab(
			combineLatest({
				workspaceId: this.workspaceId$,
				applicationId: this.applicationId$,
				instructionId: this.instructionId$,
			}).pipe(
				map(({ instructionId, applicationId, workspaceId }) => ({
					id: instructionId,
					kind: 'instruction',
					url: `/workspaces/${workspaceId}/applications/${applicationId}/instructions/${instructionId}`,
				}))
			)
		);
	}

	isRouteActive(url: string) {
		return this._router.isActive(url, {
			paths: 'exact',
			queryParams: 'exact',
			fragment: 'ignored',
			matrixParams: 'ignored',
		});
	}

	onUpdateInstruction(
		authority: string,
		workspaceId: string,
		applicationId: string,
		instructionId: string,
		instructionDto: InstructionDto
	) {
		this._instructionApiService
			.update({
				authority,
				workspaceId,
				applicationId,
				instructionDto,
				instructionId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Update instruction request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`applications:${applicationId}:instructions`,
									`instructions:${instructionId}`,
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

	onDeleteInstruction(
		authority: string,
		workspaceId: string,
		applicationId: string,
		instructionId: string
	) {
		this._instructionApiService
			.delete({
				authority,
				workspaceId,
				applicationId,
				instructionId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Delete instruction request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`applications:${applicationId}:instructions`,
									`instructions:${instructionId}`,
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
}
