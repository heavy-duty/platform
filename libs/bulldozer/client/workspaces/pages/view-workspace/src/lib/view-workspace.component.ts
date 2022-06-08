import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TabStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
	WorkspaceApiService,
	WorkspaceStore,
} from '@bulldozer-client/workspaces-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { WorkspaceDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { distinctUntilChanged, map } from 'rxjs';
import { ViewWorkspaceStore } from './view-workspace.store';

@Component({
	selector: 'bd-view-workspace',
	template: `
		<ng-container *ngrxLet="workspace$; let workspace">
			<aside class="w-80 flex flex-col flex-shrink-0 pt-5 pb-4 px-5 ml-2">
				<header class="mb-7 w-full">
					<ng-container *ngIf="workspace !== null; else notFound">
						<p class="mb-0 text-2xl uppercase bp-font">{{ workspace.name }}</p>
						<p class="text-xs m-0">
							Visualize all the details about this workspace.
						</p>
					</ng-container>
					<ng-template #notFound>
						<p class="mb-0 text-xl uppercase bp-font">not found</p>
						<p class="text-xs m-0">
							The workspace you're trying to visualize is not available.
						</p>
					</ng-template>
				</header>

				<ng-container *ngrxLet="workspaceId$; let workspaceId">
					<ul *ngIf="workspaceId !== null" class="flex-1 overflow-y-auto">
						<li>
							<a
								class="flex flex-col gap-1 py-3 px-7 bg-bp-stone-2 mb-6 mat-elevation-z4"
								[routerLink]="['/workspaces', workspaceId, 'budget']"
								[routerLinkActive]="['bg-opacity-5', 'bp-box-shadow-bg-white']"
							>
								<span class="text-lg font-bold">Budget</span>
								<span class="text-xs font-thin">
									Visualize budget details.
								</span>
							</a>
						</li>
						<li>
							<a
								class="flex flex-col gap-1 py-3 px-7 bg-bp-stone-2 mb-6 mat-elevation-z4"
								[routerLink]="['/workspaces', workspaceId, 'collaborators']"
								[routerLinkActive]="['bg-opacity-5', 'bp-box-shadow-bg-white']"
							>
								<span class="text-lg font-bold">Collaborators</span>
								<span class="text-xs font-thin">
									Visualize and manage collaborators.
								</span>
							</a>
						</li>

						<!-- <li>
              <a
                class="flex flex-col gap-1 py-3 px-7 bg-bp-stone-2 mb-6 mat-elevation-z4"
                [routerLink]="['/workspaces', workspaceId, 'instructions']"
                [routerLinkActive]="['bg-opacity-5', 'bp-box-shadow-bg-white']"
              >
                <span class="text-lg font-bold">Instructions</span>
                <span class="text-xs font-thin">
                  Visualize all the ongoing instructions.
                </span>
              </a>
            </li> -->
					</ul>
				</ng-container>

				<ng-container *hdWalletAdapter="let publicKey = publicKey">
					<footer
						*ngIf="publicKey !== null && workspace !== null"
						class="w-full py-4 px-7 h-16 flex justify-center items-center m-auto bg-bp-metal-2 shadow relative"
					>
						<button
							class="bp-button w-28"
							[workspace]="workspace"
							(editWorkspace)="
								onUpdateWorkspace(publicKey.toBase58(), workspace.id, $event)
							"
							bdEditWorkspace
						>
							Edit
						</button>
						<button
							class="bp-button w-28"
							(click)="onDeleteWorkspace(publicKey.toBase58(), workspace.id)"
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
					</footer>
				</ng-container>
			</aside>

			<figure class="w-14 mt-2">
				<img
					src="assets/images/pipe.webp"
					width="56"
					height="1500"
					alt="pipe"
				/>
			</figure>

			<div class="flex-1 overflow-y-auto">
				<router-outlet></router-outlet>
			</div>
		</ng-container>
	`,
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [WorkspaceStore, ViewWorkspaceStore],
})
export class ViewWorkspaceComponent implements OnInit {
	@HostBinding('class') class = 'flex h-full';

	readonly workspaceId$ = this._route.paramMap.pipe(
		map((paramMap) => paramMap.get('workspaceId')),
		isNotNullOrUndefined,
		distinctUntilChanged()
	);
	readonly workspace$ = this._viewWorkspaceStore.workspace$;

	constructor(
		private readonly _router: Router,
		private readonly _route: ActivatedRoute,
		private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
		private readonly _tabStore: TabStore,
		private readonly _notificationStore: NotificationStore,
		private readonly _workspaceApiService: WorkspaceApiService,
		private readonly _viewWorkspaceStore: ViewWorkspaceStore
	) {}

	ngOnInit() {
		this._viewWorkspaceStore.setWorkspaceId(this.workspaceId$);
		this._tabStore.openTab(
			this.workspaceId$.pipe(
				map((workspaceId) => ({
					id: workspaceId,
					kind: 'workspace',
					url: `/workspaces/${workspaceId}`,
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

	onUpdateWorkspace(
		authority: string,
		workspaceId: string,
		workspaceDto: WorkspaceDto
	) {
		this._workspaceApiService
			.update({
				workspaceDto,
				authority,
				workspaceId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Update workspace request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`workspace:${workspaceId}`,
									`authority:${authority}`,
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

	onDeleteWorkspace(authority: string, workspaceId: string) {
		this._workspaceApiService
			.delete({
				authority,
				workspaceId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Delete workspace request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`workspace:${workspaceId}`,
									`authority:${authority}`,
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
