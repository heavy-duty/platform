import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnInit,
} from '@angular/core';
import { ApplicationApiService } from '@bulldozer-client/applications-data-access';
import { ConfigStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { UserApiService, UserStore } from '@bulldozer-client/users-data-access';
import {
	WorkspaceApiService,
	WorkspaceStore,
} from '@bulldozer-client/workspaces-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import {
	ApplicationDto,
	UserDto,
	WorkspaceDto,
} from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { Keypair } from '@solana/web3.js';
import { map } from 'rxjs';
import { WorkspaceDownloaderService } from './workspace-downloader.service';
import { WorkspaceExplorerUserStore } from './workspace-explorer-user.store';
import { WorkspaceExplorerStore } from './workspace-explorer.store';

@Component({
	selector: 'bd-workspace-explorer',
	template: `
		<ng-container *ngrxLet="workspace$; let workspace">
			<div class="flex flex-col h-screen">
				<div
					*ngrxLet="user$; let user"
					class="flex items-center justify-center"
				>
					<div *ngIf="user === null" class="w-36 mt-5 pb-3">
						<figure class="w-20 h-20 m-auto mb-2 relative">
							<img
								alt=""
								src="assets/images/default-profile.png"
								width="80"
								height="80"
							/>
							<img
								class="w-6 absolute right-0 bottom-0"
								alt=""
								src="assets/images/important.png"
								width="24"
								height="24"
							/>
						</figure>
						<ng-container *hdWalletAdapter="let publicKey = publicKey">
							<ng-container *ngrxLet="userId$; let userId">
								<button
									*ngIf="publicKey !== null && userId !== null"
									(editUser)="
										onCreateUser(publicKey.toBase58(), userId, $event)
									"
									bdEditUser
								>
									Click here to a create new user
								</button>
							</ng-container>
						</ng-container>
					</div>
					<!-- Move to components -->

					<a
						*ngIf="user !== null"
						class="w-36 mt-5 pb-3"
						[routerLink]="['/profile', 'info']"
					>
						<figure
							class="w-20 h-20 mb-2 mx-auto rounded-full overflow-hidden bg-black bg-opacity-10"
						>
							<img
								class="w-full"
								[src]="user.thumbnailUrl"
								alt=""
								onerror="this.src='assets/images/default-profile.png';"
								width="80"
								height="80"
							/>
						</figure>

						<p class="flex items-center justify-center gap-2 mb-0">
							<span>
								{{ user.name }}
							</span>
							<span
								*ngIf="user | bdItemChanging"
								class="h-4 w-4 border-4 border-accent"
								hdProgressSpinner
							></span>
						</p>
						<p class="m-0 text-center">
							<a
								class="text-accent underline"
								[href]="'https://explorer.solana.com/address/' + user.id"
								target="__blank"
								>@{{ user.userName }}</a
							>
						</p>
					</a>
				</div>

				<div
					*hdWalletAdapter="
						let publicKey = publicKey;
						let connected = connected
					"
					class="flex-grow overflow-auto"
				>
					<ng-container *ngIf="workspace !== null">
						<h3 class="ml-4 mt-4 mb-0 flex justify-between items-center">
							<span class="hd-highlight-title uppercase"> Explorer </span>
							<div *hdWalletAdapter="let publicKey = publicKey">
								<button
									*ngIf="publicKey !== null"
									(editApplication)="
										onCreateApplication(
											publicKey.toBase58(),
											workspace.id,
											$event
										)
									"
									mat-icon-button
									aria-label="Add new app"
									bdEditApplication
								>
									<mat-icon>add</mat-icon>
								</button>
							</div>
						</h3>
						<bd-application-explorer
							[connected]="connected"
							[workspaceId]="workspace.id"
						></bd-application-explorer>
					</ng-container>
				</div>

				<div class="w-full px-4 flex flex-col gap-2 ">
					<div
						class="flex flex-col gap-2 bg-bp-metal bg-black px-4 py-5 mb-4 rounded mat-elevation-z8"
					>
						<bd-card *ngIf="workspace !== null">
							<h3 class="mb-2 hd-highlight-title uppercase text-sm">
								Active workspace
							</h3>
							<div
								class="flex items-center px-4 py-2 bg-black bg-opacity-40 rounded-md mb-2"
							>
								<span
									class="flex-grow overflow-hidden whitespace-nowrap overflow-ellipsis"
								>
									{{ workspace.name }}
								</span>
								<a
									[routerLink]="['/workspaces', workspace.id]"
									mat-fab-button
									aria-label="View workspace details"
								>
									<mat-icon inline>open_in_new</mat-icon>
								</a>
							</div>
						</bd-card>
						<div class="flex gap-2">
							<bd-card>
								<div class="flex items-center">
									<figure
										class="flex justify-center items-center w-10 h-10 rounded-full overflow-hidden bg-bp-black"
									>
										<img
											class="w-8/12"
											alt=""
											src="assets/images/logo.webp"
											width="26"
											height="34"
										/>
									</figure>
								</div>
							</bd-card>
							<bd-card
								*hdWalletAdapter="let publicKey = publicKey"
								class="flex-1 flex items-center"
							>
								<button
									*ngIf="publicKey !== null"
									class="bp-button w-full"
									(newWorkspace)="
										onCreateWorkspace(publicKey.toBase58(), $event)
									"
									(importWorkspace)="onImportWorkspace($event)"
									bdAddWorkspace
								>
									Build
								</button>
							</bd-card>
						</div>
					</div>
				</div>
			</div>
		</ng-container>
	`,
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		WorkspaceExplorerUserStore,
		WorkspaceExplorerStore,
		UserStore,
		WorkspaceStore,
	],
})
export class WorkspaceExplorerComponent implements OnInit {
	@Input() set workspaceId(value: string | null) {
		this._workspaceExplorerStore.setWorkspaceId(value);
	}

	readonly userId$ = this._userStore.userId$;
	readonly user$ = this._workspaceExplorerUserStore.user$;
	readonly workspace$ = this._workspaceExplorerStore.workspace$;

	constructor(
		private readonly _walletStore: WalletStore,
		private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
		private readonly _notificationStore: NotificationStore,
		private readonly _userApiService: UserApiService,
		private readonly _workspaceExplorerStore: WorkspaceExplorerStore,
		private readonly _workspaceExplorerUserStore: WorkspaceExplorerUserStore,
		private readonly _applicationApiService: ApplicationApiService,
		private readonly _workspaceApiService: WorkspaceApiService,
		private readonly _configStore: ConfigStore,
		private readonly _userStore: UserStore,
		private readonly _workspaceDownloaderService: WorkspaceDownloaderService
	) {}

	ngOnInit() {
		this._workspaceExplorerUserStore.setAuthority(
			this._walletStore.publicKey$.pipe(
				isNotNullOrUndefined,
				map((publicKey) => publicKey.toBase58())
			)
		);
	}

	onCreateUser(authority: string, userId: string, userDto: UserDto) {
		this._userApiService
			.create({
				authority,
				userDto,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Create user request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [`authority:${authority}`, `user:${userId}`],
							},
						})
					);
				},
				error: (error) => {
					this._notificationStore.setError(error);
				},
			});
	}

	onDownloadWorkspace(workspaceId: string) {
		this._workspaceDownloaderService.downloadWorkspace(workspaceId).subscribe({
			error: (error) => {
				this._notificationStore.setError(error);
			},
		});
	}

	onCreateWorkspace(authority: string, workspaceDto: WorkspaceDto) {
		const workspaceKeypair = Keypair.generate();

		this._workspaceApiService
			.create(workspaceKeypair, {
				authority,
				workspaceDto,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Create workspace request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`workspace:${workspaceKeypair.publicKey.toBase58()}`,
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

	onCreateApplication(
		authority: string,
		workspaceId: string,
		applicationDto: ApplicationDto
	) {
		const applicationKeypair = Keypair.generate();

		this._applicationApiService
			.create(applicationKeypair, {
				authority,
				workspaceId,
				applicationDto,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Create workspace request sent');
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

	onImportWorkspace(workspaceId: string) {
		this._workspaceApiService.findById(workspaceId).subscribe((workspace) => {
			if (workspace === null) {
				this._notificationStore.setError('Workspace does not exist.');
			} else {
				this._configStore.setWorkspaceId(workspaceId);
			}
		});
	}
}
