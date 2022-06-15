import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
	ApplicationApiService,
	ApplicationQueryStore,
	ApplicationsStore,
} from '@bulldozer-client/applications-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { ApplicationDto } from '@heavy-duty/bulldozer-devkit';
import { Keypair } from '@solana/web3.js';
import { ApplicationExplorerStore } from './application-explorer.store';
import { ApplicationItemView } from './types';

@Component({
	selector: 'bd-application-explorer',
	template: `
		<ng-container *ngrxLet="applications$; let applications">
			<div class="overflow-y-auto">
				<mat-expansion-panel
					*ngFor="let application of applications; trackBy: identify"
					class="flex-shrink-0"
					togglePosition="before"
				>
					<mat-expansion-panel-header class="pl-4 pr-0">
						<div class="flex justify-between items-center flex-grow">
							<mat-panel-title
								class="w-28 flex justify-between gap-2 items-center flex-grow m-0"
								[matTooltip]="
									application.name
										| bdItemUpdatingMessage: application:'Application'
								"
								matTooltipShowDelay="500"
							>
								<span
									class="flex-grow font-bold text-left overflow-hidden whitespace-nowrap overflow-ellipsis"
								>
									{{ application.name }}
								</span>

								<span
									*ngIf="application | bdItemShowSpinner"
									class="flex-shrink-0 h-4 w-4 border-4 border-accent"
									hdProgressSpinner
								></span>
							</mat-panel-title>

							<ng-container *hdWalletAdapter="let publicKey = publicKey">
								<ng-container *ngIf="publicKey !== null">
									<button
										[attr.aria-label]="
											'More options of ' + application.name + ' application'
										"
										[matMenuTriggerFor]="applicationOptionsMenu"
										mat-icon-button
										bdStopPropagation
									>
										<mat-icon>more_horiz</mat-icon>
									</button>

									<mat-menu
										#applicationOptionsMenu="matMenu"
										class="bg-bp-wood bg-bp-brown"
									>
										<!-- <a
                  mat-menu-item
                  [routerLink]="[
                    '/workspaces',
                    application.document.data.workspace,
                    'applications',
                    application.document.id
                  ]"
                >
                  <mat-icon>launch</mat-icon>
                  <span>View application</span>
                </a> -->
										<button
											[application]="application"
											[disabled]="!connected || (application | bdItemChanging)"
											(editApplication)="
												onUpdateApplication(
													publicKey.toBase58(),
													application.workspaceId,
													application.id,
													$event
												)
											"
											mat-menu-item
											bdEditApplication
										>
											<mat-icon>edit</mat-icon>
											<span>Edit application</span>
										</button>
										<button
											[disabled]="!connected || (application | bdItemChanging)"
											(click)="
												onDeleteApplication(
													publicKey.toBase58(),
													application.workspaceId,
													application.id
												)
											"
											mat-menu-item
										>
											<mat-icon>delete</mat-icon>
											<span>Delete application</span>
										</button>
									</mat-menu>
								</ng-container>
							</ng-container>
						</div>
					</mat-expansion-panel-header>

					<bd-collection-explorer
						[applicationId]="application.id"
						[workspaceId]="application.workspaceId"
						[disableCreate]="application.isCreating || application.isDeleting"
					>
					</bd-collection-explorer>

					<bd-instruction-explorer
						[applicationId]="application.id"
						[workspaceId]="application.workspaceId"
						[disableCreate]="application.isCreating || application.isDeleting"
					>
					</bd-instruction-explorer>
				</mat-expansion-panel>
			</div>
		</ng-container>
	`,
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		ApplicationsStore,
		ApplicationQueryStore,
		ApplicationExplorerStore,
	],
})
export class ApplicationExplorerComponent {
	@Input() connected = false;

	@Input() set workspaceId(value: string) {
		this._applicationExplorerStore.setWorkspaceId(value);
	}

	readonly workspaceId$ = this._applicationExplorerStore.workspaceId$;
	readonly applications$ = this._applicationExplorerStore.applications$;

	constructor(
		private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
		private readonly _notificationStore: NotificationStore,
		private readonly _applicationApiService: ApplicationApiService,
		private readonly _applicationExplorerStore: ApplicationExplorerStore
	) {}

	onCreateApplication(
		authority: string,
		workspaceId: string,
		applicationDto: ApplicationDto
	) {
		const applicationKeypair = Keypair.generate();

		this._applicationApiService
			.create(applicationKeypair, {
				applicationDto,
				authority,
				workspaceId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Create application request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`workspaces:${workspaceId}:applications`,
									`applications:${applicationKeypair.publicKey.toBase58()}`,
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

	onUpdateApplication(
		authority: string,
		workspaceId: string,
		applicationId: string,
		applicationDto: ApplicationDto
	) {
		this._applicationApiService
			.update({
				authority,
				workspaceId,
				applicationId,
				applicationDto,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Update application request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`workspaces:${workspaceId}:applications`,
									`applications:${applicationId}`,
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

	onDeleteApplication(
		authority: string,
		workspaceId: string,
		applicationId: string
	) {
		this._applicationApiService
			.delete({
				authority,
				workspaceId,
				applicationId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Delete application request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`workspaces:${workspaceId}:applications`,
									`applications:${applicationId}`,
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

	identify(_: number, application: ApplicationItemView) {
		return application.id;
	}
}
