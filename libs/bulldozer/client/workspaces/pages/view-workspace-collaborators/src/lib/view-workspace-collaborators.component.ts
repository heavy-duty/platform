import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore } from '@bulldozer-client/auth-data-access';
import {
	CollaboratorApiService,
	CollaboratorsStore,
} from '@bulldozer-client/collaborators-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { UsersStore } from '@bulldozer-client/users-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import {
	CollaboratorDto,
	findCollaboratorAddress,
} from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
	combineLatest,
	distinctUntilChanged,
	EMPTY,
	map,
	switchMap,
} from 'rxjs';
import { CollaboratorItemView, UserItemView } from './types';
import { ViewWorkspaceCollaboratorsUsersStore } from './view-workspace-collaborators-users.store';
import { ViewWorkspaceCollaboratorsStore } from './view-workspace-collaborators.store';

interface ViewModel {
	status: number;
	currentCollaboratorId: string | null;
}

@Component({
	selector: 'bd-view-workspace-collaborators',
	template: `
		<header class="mb-10">
			<h1 class="text-4xl uppercase m-0 bp-font">Collaborators</h1>
			<p>Filter by collaborator status</p>

			<div class="flex gap-4">
				<div class="px-8 py-3 w-60 h-16 bg-bp-metal-2 shadow relative">
					<mat-form-field class="bg-bp-black">
						<mat-select
							[value]="status$ | ngrxPush"
							(valueChange)="onSetStatus($event)"
						>
							<mat-option [value]="1">
								<span
									class="inline-block bg-green-500 w-2 h-2 rounded-full"
								></span>
								Approved
							</mat-option>
							<mat-option [value]="0">
								<span
									class="inline-block bg-yellow-500 w-2 h-2 rounded-full"
								></span>
								Pending
							</mat-option>
							<mat-option [value]="2">
								<span
									class="inline-block bg-red-500 w-2 h-2 rounded-full"
								></span>
								Rejected
							</mat-option>
						</mat-select>
					</mat-form-field>
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
				</div>

				<ng-container *ngIf="workspaceId$ | ngrxPush as workspaceId">
					<ng-container
						*ngrxLet="currentCollaborator$; let currentCollaborator"
					>
						<ng-container *hdWalletAdapter="let publicKey = publicKey">
							<div
								*ngIf="publicKey !== null && currentCollaborator === null"
								class="py-4 px-7 w-60 h-16 bg-bp-metal-2 shadow flex justify-center items-center relative"
							>
								<button
									class="bp-button"
									(click)="
										onRequestCollaboratorStatus(
											publicKey.toBase58(),
											workspaceId
										)
									"
								>
									Become Collaborator
								</button>

								<div
									class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-7 left-2"
								>
									<div class="w-full h-px bg-gray-600 rotate-45"></div>
								</div>
								<div
									class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-7 right-2"
								>
									<div class="w-full h-px bg-gray-600 rotate-12"></div>
								</div>
							</div>

							<div
								*ngIf="
									publicKey !== null &&
									currentCollaborator !== null &&
									currentCollaborator.status.id === 2
								"
								class="py-4 px-7 w-60 h-16 bg-bp-metal-2 shadow flex justify-center items-center relative"
							>
								<button
									[disabled]="currentCollaborator | bdItemChanging"
									(click)="
										onRetryCollaboratorStatusRequest(
											publicKey.toBase58(),
											currentCollaborator.workspaceId,
											currentCollaborator.id
										)
									"
									mat-stroked-button
									color="accent"
								>
									Try again
								</button>

								<div
									class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-7 left-2"
								>
									<div class="w-full h-px bg-gray-600 rotate-45"></div>
								</div>
								<div
									class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-7 right-2"
								>
									<div class="w-full h-px bg-gray-600 rotate-12"></div>
								</div>
							</div>
						</ng-container>
					</ng-container>
				</ng-container>
			</div>
		</header>

		<div class="flex flex-wrap gap-4">
			<div
				*ngFor="
					let collaborator of filteredCollaborators$ | ngrxPush;
					trackBy: identify
				"
				class="flex flex-col gap-2 bg-bp-metal bg-black px-4 py-5 rounded mat-elevation-z8"
			>
				<div class="flex gap-2">
					<bd-card class="flex-1 flex items-center gap-2">
						<figure
							*ngIf="!(collaborator | bdItemChanging)"
							class="w-20 h-20 rounded-full overflow-hidden"
						>
							<img
								class="w-full"
								[src]="collaborator.user.thumbnailUrl"
								alt=""
								width="80"
								height="80"
								onerror="this.src='assets/images/default-profile.png';"
							/>
						</figure>
						<div
							*ngIf="collaborator | bdItemChanging"
							class="flex justify-center items-center w-20 h-20 rounded-full overflow-hidden bg-bp-black"
						>
							<span
								class="h-8 w-8 border-4 border-accent"
								hdProgressSpinner
							></span>
						</div>

						<div>
							<p class="flex items-center justify-start gap-2 mb-0 text-2xl">
								<span
									class="leading-none"
									[matTooltip]="
										collaborator.user.name
											| bdItemUpdatingMessage: collaborator.user:'User'
									"
									matTooltipShowDelay="500"
								>
									{{ collaborator.user.name }}
								</span>

								<mat-icon
									*ngIf="collaborator.isAdmin"
									class="inline pl-2 text-base"
									color="accent"
									inline
								>
									admin_panel_settings
								</mat-icon>
							</p>
							<p class="m-0">
								<a
									class="text-accent underline"
									[href]="
										'https://explorer.solana.com/address/' +
										collaborator.user.id
									"
									target="__blank"
									>@{{ collaborator.user.userName }}</a
								>
							</p>
							<p class="m-0">
								<mat-icon class="text-sm w-4 mr-1">event</mat-icon>
								Builder since
								{{ collaborator.createdAt | date: 'mediumDate' }}
							</p>
						</div>
					</bd-card>
					<bd-card class="flex flex-col justify-center">
						<div
							*hdWalletAdapter="
								let publicKey = publicKey;
								let connected = connected
							"
							class="flex gap-2"
						>
							<ng-container *ngIf="publicKey !== null">
								<button
									*ngIf="collaborator.status.id === 1"
									class="bp-button w-28"
									[disabled]="!connected || (collaborator | bdItemChanging)"
									(click)="
										onUpdateCollaborator(
											publicKey.toBase58(),
											collaborator.workspaceId,
											collaborator.id,
											{ status: 2 }
										)
									"
								>
									Revoke
								</button>
								<button
									*ngIf="collaborator.status.id === 0"
									class="bp-button w-28"
									[disabled]="!connected || (collaborator | bdItemChanging)"
									(click)="
										onUpdateCollaborator(
											publicKey.toBase58(),
											collaborator.workspaceId,
											collaborator.id,
											{ status: 1 }
										)
									"
								>
									Approve
								</button>
								<button
									*ngIf="collaborator.status.id === 2"
									class="bp-button w-28"
									[disabled]="!connected || (collaborator | bdItemChanging)"
									(click)="
										onUpdateCollaborator(
											publicKey.toBase58(),
											collaborator.workspaceId,
											collaborator.id,
											{ status: 1 }
										)
									"
								>
									Grant
								</button>

								<button
									*ngIf="collaborator.status.id === 0"
									class="bp-button w-28"
									[disabled]="!connected || (collaborator | bdItemChanging)"
									(click)="
										onUpdateCollaborator(
											publicKey.toBase58(),
											collaborator.workspaceId,
											collaborator.id,
											{ status: 2 }
										)
									"
								>
									Reject
								</button>
							</ng-container>
						</div>
					</bd-card>
				</div>
				<bd-card>
					<dl class="flex justify-between gap-5">
						<div class="flex-1">
							<dt class="mb-2">Name:</dt>
							<dd
								class="flex items-center w-64 h-10 gap-1 px-2 bg-bp-black bg-opacity-70 rounded-md"
							>
								<span
									class="overflow-hidden whitespace-nowrap overflow-ellipsis"
								>
									{{ collaborator.user.name }}
								</span>
							</dd>
						</div>

						<div class="flex-1">
							<dt class="mb-2">Authority:</dt>
							<dd
								class="flex items-center w-64 h-10 gap-1 px-2 bg-bp-black bg-opacity-70 rounded-md"
							>
								<span
									class="w-48 overflow-hidden whitespace-nowrap overflow-ellipsis"
								>
									{{
										collaborator.user.authority | obscureAddress: '.':[09, 35]
									}}
								</span>

								<button
									[cdkCopyToClipboard]="collaborator.user.authority"
									aria-label="Copy user authority"
									mat-icon-button
								>
									<mat-icon>content_copy</mat-icon>
								</button>
							</dd>
						</div>
					</dl>
				</bd-card>
			</div>
		</div>
	`,
	styles: [],
	providers: [
		CollaboratorsStore,
		UsersStore,
		ViewWorkspaceCollaboratorsStore,
		ViewWorkspaceCollaboratorsUsersStore,
	],
})
export class ViewWorkspaceCollaboratorsComponent
	extends ComponentStore<ViewModel>
	implements OnInit
{
	@HostBinding('class') class = 'block p-8 pt-5 h-full';
	readonly workspaceId$ = this._route.paramMap.pipe(
		map((paramMap) => paramMap.get('workspaceId')),
		isNotNullOrUndefined,
		distinctUntilChanged()
	);
	readonly userIds$ = this.select(
		this._viewWorkspaceCollaboratorsStore.collaboratorsMap$,
		(collaboratorsMap) => {
			if (collaboratorsMap === null) {
				return null;
			}

			return collaboratorsMap.map(({ userId }) => userId).toList();
		}
	).pipe(
		distinctUntilChanged(
			(previous, current) => previous?.join('') === current?.join('')
		)
	);
	readonly status$ = this.select(({ status }) => status);
	readonly collaborators$ = this.select(
		this._viewWorkspaceCollaboratorsStore.collaboratorsMap$,
		this._viewWorkspaceCollaboratorsUsersStore.usersMap$,
		(collaboratorsMap, usersMap) => {
			if (collaboratorsMap === null || usersMap === null) {
				return null;
			}

			return collaboratorsMap
				.map((collaborator) => {
					const user = usersMap.get(collaborator.userId);

					if (user === undefined) {
						return null;
					}

					return {
						...collaborator,
						user,
					};
				})
				.filter(
					(data): data is CollaboratorItemView & { user: UserItemView } =>
						data !== null
				)
				.sort((a, b) => a.createdAt - b.createdAt)
				.toList();
		}
	);
	readonly filteredCollaborators$ = this.select(
		this.collaborators$,
		this.status$,
		(collaborators, status) => {
			if (collaborators === null) {
				return null;
			}

			return collaborators.filter(
				(collaborator) => collaborator.status.id === status
			);
		}
	);
	readonly currentCollaborator$ = this.select(
		this.collaborators$.pipe(isNotNullOrUndefined),
		this.select(({ currentCollaboratorId }) => currentCollaboratorId).pipe(
			isNotNullOrUndefined
		),
		(collaborators, currentCollaboratorId) =>
			collaborators.find(
				(collaborator) => collaborator.id === currentCollaboratorId
			) ?? null
	);

	constructor(
		private readonly _authStore: AuthStore,
		private readonly _route: ActivatedRoute,
		private readonly _collaboratorApiService: CollaboratorApiService,
		private readonly _viewWorkspaceCollaboratorsStore: ViewWorkspaceCollaboratorsStore,
		private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
		private readonly _notificationStore: NotificationStore,
		private readonly _viewWorkspaceCollaboratorsUsersStore: ViewWorkspaceCollaboratorsUsersStore
	) {
		super({
			status: 1,
			currentCollaboratorId: null,
		});
	}

	private readonly _setStatus = this.updater<number>((state, status) => ({
		...state,
		status,
	}));

	private readonly _loadCurrentCollaboratorId = this.effect(
		switchMap(({ workspaceId, userId }) => {
			this.patchState({ currentCollaboratorId: null });

			if (workspaceId === null || userId === null) {
				return EMPTY;
			}

			return findCollaboratorAddress(workspaceId, userId).pipe(
				tapResponse(
					([currentCollaboratorId]) =>
						this.patchState({ currentCollaboratorId }),
					(error) => this._notificationStore.setError(error)
				)
			);
		})
	);

	ngOnInit() {
		this._loadCurrentCollaboratorId(
			combineLatest({
				workspaceId: this.workspaceId$,
				userId: this._authStore.userId$,
			})
		);
		this._viewWorkspaceCollaboratorsStore.setWorkspaceId(this.workspaceId$);
		this._viewWorkspaceCollaboratorsUsersStore.setUserIds(this.userIds$);
	}

	onRequestCollaboratorStatus(authority: string, workspaceId: string) {
		this._collaboratorApiService
			.requestCollaboratorStatus({
				authority,
				workspaceId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent(
						'Request collaborator status request sent'
					);
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`workspace:${workspaceId}:collaborators`,
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

	onRetryCollaboratorStatusRequest(
		authority: string,
		workspaceId: string,
		collaboratorId: string
	) {
		this._collaboratorApiService
			.retryCollaboratorStatusRequest({
				authority,
				workspaceId,
				collaboratorId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent(
						'Retry collaborator status request sent'
					);
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`workspace:${workspaceId}:collaborators`,
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

	onUpdateCollaborator(
		authority: string,
		workspaceId: string,
		collaboratorId: string,
		collaboratorDto: CollaboratorDto
	) {
		this._collaboratorApiService
			.update({
				authority,
				workspaceId,
				collaboratorId,
				collaboratorDto,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Update collaborator request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`workspace:${workspaceId}:collaborators`,
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

	onSetStatus(status: number) {
		this._setStatus(status);
	}

	identify(_: number, collaborator: CollaboratorItemView) {
		return collaborator.id;
	}
}
