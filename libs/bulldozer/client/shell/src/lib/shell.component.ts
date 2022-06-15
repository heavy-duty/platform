import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '@bulldozer-client/auth-data-access';
import {
	ConfigStore,
	DarkThemeStore,
	TabStore,
} from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
	UserInstructionsStore2,
	UserStore,
} from '@bulldozer-client/users-data-access';
import { HdSolanaConfigStore } from '@heavy-duty/ngx-solana';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { distinctUntilChanged, filter, pairwise, pipe, tap } from 'rxjs';

@Component({
	selector: 'bd-shell',
	template: `
		<div>
			<mat-sidenav-container class="h-screen-layout w-full bg-transparent">
				<mat-sidenav
					#navigation
					class=" w-80 bd-bg-stone"
					[attr.role]="(isHandset$ | ngrxPush) ? 'dialog' : 'navigation'"
					[mode]="(isHandset$ | ngrxPush) ? 'over' : 'side'"
					[opened]="(isHandset$ | ngrxPush) === false"
					[disableClose]="(isHandset$ | ngrxPush) === false"
					fixedInViewport
				>
					<bd-workspace-explorer
						[workspaceId]="(workspaceId$ | ngrxPush) ?? null"
					></bd-workspace-explorer>
				</mat-sidenav>

				<mat-sidenav-content>
					<div class="flex flex-col h-screen  bg-bd-black bg-opacity-40">
						<div class="flex items-center gap-2  ">
							<div *ngIf="isHandset$ | async" class="px-4">
								<button
									(click)="navigation.toggle()"
									type="button"
									mat-mini-fab
								>
									<mat-icon aria-label="Toggle menu">menu</mat-icon>
								</button>
							</div>

							<bd-tab-list
								class="flex-grow overflow-x-auto overflow-y-hidden"
								[tabs]="(tabs$ | ngrxPush) ?? null"
								[selectedTab]="(selectedTab$ | ngrxPush) ?? null"
								(closeTab)="onCloseTab($event)"
							></bd-tab-list>

							<div class="px-4 flex items-center gap-4">
								<bd-user-instructions-button></bd-user-instructions-button>

								<button
									(click)="settings.toggle()"
									type="button"
									mat-icon-button
								>
									<mat-icon
										aria-hidden="false"
										aria-label="Bulldozer tool settings"
										>settings</mat-icon
									>
								</button>
							</div>
						</div>

						<div class="flex-grow overflow-hidden">
							<router-outlet></router-outlet>
						</div>
					</div>
				</mat-sidenav-content>

				<mat-sidenav
					#settings
					class="bd-h-inherit w-80 bg-bp-wood bg-bp-brown px-4"
					[mode]="'over'"
					[opened]="false"
					fixedInViewport
					position="end"
				>
					<header class="mt-8 mb-4 border-b hd-border-gray">
						<h1 class="m-0 uppercase bp-font">Settings</h1>
					</header>

					<main class="flex flex-col">
						<section
							*hdWalletAdapter="
								let wallet = wallet;
								let wallets = wallets;
								let publicKey = publicKey;
								let selectWallet = selectWallet
							"
							class="bottom-0 py-6 px-4 mb-8 bg-bp-metal-2 bg-black relative mat-elevation-z4"
						>
							<h2 class="m-0 mb-4 hd-highlight-title text-base uppercase">
								Wallet
							</h2>

							<ng-container *ngIf="publicKey !== null && wallet !== null">
								<p
									class="flex items-center gap-2 px-2 bg-black bg-opacity-40 rounded-md"
								>
									<hd-wallet-icon
										class="flex-shrink-0"
										[wallet]="wallet"
									></hd-wallet-icon>

									<span
										class="overflow-hidden whitespace-nowrap overflow-ellipsis"
									>
										{{ publicKey.toBase58() }}
									</span>

									<button
										[cdkCopyToClipboard]="publicKey.toBase58()"
										mat-icon-button
									>
										<mat-icon>content_copy</mat-icon>
									</button>
								</p>

								<div class="flex justify-between">
									<hd-wallet-modal-button class="flex-1">
										<ng-container #children> Change wallet </ng-container>
									</hd-wallet-modal-button>
									<hd-wallet-disconnect-button class="flex-1">
										<ng-container #children> Disconnect </ng-container>
									</hd-wallet-disconnect-button>
								</div>
								<div
									class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-2 left-2"
								>
									<div class="w-full h-px bg-gray-600 rotate-45"></div>
								</div>
								<div
									class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-2 right-2"
								>
									<div class="w-full h-px bg-gray-600 rotate-12"></div>
								</div>
								<div
									class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute bottom-2 left-2"
								>
									<div class="w-full h-px bg-gray-600 rotate-45"></div>
								</div>
								<div
									class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute bottom-2 right-2"
								>
									<div class="w-full h-px bg-gray-600"></div>
								</div>
							</ng-container>
						</section>

						<!-- <section
              class="px-7 py-8 border-b hd-border-gray"
              *hdSolanaConfig="
                let selectedNetwork = selectedNetwork;
                let networkConfigs = networkConfigs;
                let selectNetwork = selectNetwork;
                let selectedNetworkConfig = selectedNetworkConfig;
                let editNetworkConfig = editNetworkConfig
              "
            >
              <h2 class="m-0 hd-highlight-title uppercase">Network</h2>

              <hd-network-selector
                *ngIf="networkConfigs !== null"
                [selectedNetwork]="selectedNetwork"
                [networkConfigs]="networkConfigs"
                (selectNetwork)="selectNetwork($event)"
              ></hd-network-selector>

              <header class="flex items-center justify-between gap-2">
                <h2 class="m-0 hd-highlight-title uppercase">endpoints</h2>

                <button
                  *ngIf="selectedNetworkConfig !== null"
                  mat-icon-button
                  hdEditEndpointsModal
                  [apiEndpoint]="selectedNetworkConfig.apiEndpoint"
                  [webSocketEndpoint]="selectedNetworkConfig.webSocketEndpoint"
                  (editEndpoints)="
                    editNetworkConfig({
                      network: selectedNetworkConfig.network,
                      apiEndpoint: $event.apiEndpoint,
                      webSocketEndpoint: $event.webSocketEndpoint
                    })
                  "
                  aria-label="Change endpoints"
                  color="accent"
                >
                  <mat-icon>edit</mat-icon>
                </button>
              </header>

              <ng-container *ngIf="selectedNetworkConfig !== null">
                <h3 class="m-0">API:</h3>
                <p
                  class="flex items-center justify-between px-2 bg-black bg-opacity-10 rounded-md"
                >
                  <span
                    class="overflow-hidden whitespace-nowrap overflow-ellipsis"
                  >
                    {{ selectedNetworkConfig.apiEndpoint }}
                  </span>

                  <button
                    mat-icon-button
                    [cdkCopyToClipboard]="selectedNetworkConfig.apiEndpoint"
                  >
                    <mat-icon>content_copy</mat-icon>
                  </button>
                </p>

                <h3 class="m-0">WebSocket:</h3>
                <p
                  class="flex items-center justify-between px-2 bg-black bg-opacity-10 rounded-md"
                >
                  <span
                    class="overflow-hidden whitespace-nowrap overflow-ellipsis"
                  >
                    {{ selectedNetworkConfig.webSocketEndpoint }}
                  </span>

                  <button
                    mat-icon-button
                    [cdkCopyToClipboard]="
                      selectedNetworkConfig.webSocketEndpoint
                    "
                  >
                    <mat-icon>content_copy</mat-icon>
                  </button>
                </p>
              </ng-container>

              <hd-connection-status
                *hdSolanaConnection="
                  let online = online;
                  let connected = connected;
                  let connecting = connecting;
                  let onlineSince = onlineSince;
                  let offlineSince = offlineSince;
                  let connectedAt = connectedAt;
                  let nextAttemptAt = nextAttemptAt;
                  let reconnect = reconnect
                "
                [online]="online"
                [connected]="connected"
                [connecting]="connecting"
                [onlineSince]="onlineSince"
                [offlineSince]="offlineSince"
                [connectedAt]="connectedAt"
                [nextAttemptRelativeTime]="
                  nextAttemptAt | hdRelativeTime | async
                "
                (reconnect)="reconnect()"
              >
              </hd-connection-status>
            </section> -->
					</main>
				</mat-sidenav>
			</mat-sidenav-container>
		</div>
	`,
	providers: [
		AuthStore,
		TabStore,
		NotificationStore,
		ConfigStore,
		DarkThemeStore,
		UserStore,
		UserInstructionsStore2,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent extends ComponentStore<object> {
	readonly isHandset$ = this._configStore.isHandset$;
	readonly connected$ = this._walletStore.connected$;
	readonly walletPublicKey$ = this._walletStore.publicKey$;
	readonly workspaceId$ = this._configStore.workspaceId$;
	readonly tabs$ = this._tabStore.tabs$;
	readonly selectedTab$ = this._tabStore.selected$;

	constructor(
		private readonly _walletStore: WalletStore,
		private readonly _tabStore: TabStore,
		private readonly _configStore: ConfigStore,
		private readonly _notificationStore: NotificationStore,
		private readonly _router: Router,
		private readonly _hdSolanaConfigStore: HdSolanaConfigStore
	) {
		super();

		this._handleNetworkChanges(this._hdSolanaConfigStore.selectedNetwork$);
		this._redirectUnauthorized(this._walletStore.connected$);
		this._notificationStore.setError(this._walletStore.error$);
	}

	private readonly _redirectUnauthorized = this.effect<boolean>(
		pipe(
			filter((connected) => !connected),
			tap(() =>
				this._router.navigate(['/unauthorized-access'], {
					queryParams: {
						redirect: this._router.routerState.snapshot.url,
					},
				})
			)
		)
	);

	private readonly _handleNetworkChanges = this.effect(
		pipe(
			distinctUntilChanged(),
			pairwise(),
			tap(() => this._router.navigate(['/']))
		)
	);

	onCloseTab(tabId: string) {
		this._tabStore.closeTab(tabId);
	}
}
