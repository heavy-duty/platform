import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  ConfigStore,
  DarkThemeStore,
  TabStore,
} from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { UserStore } from '@bulldozer-client/users-data-access';
import {
  HdBroadcasterSocketStore,
  HdBroadcasterStore,
} from '@heavy-duty/broadcaster';
import {
  HdSolanaApiService,
  HdSolanaConfigStore,
  HdSolanaTransactionsStore,
} from '@heavy-duty/ngx-solana';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { PublicKey } from '@solana/web3.js';
import {
  distinctUntilChanged,
  EMPTY,
  filter,
  pairwise,
  pipe,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

@Component({
  selector: 'bd-shell',
  template: `
    <div>
      <mat-sidenav-container class="h-screen-layout w-full">
        <mat-sidenav
          #navigation
          class="bd-h-inherit w-60"
          fixedInViewport
          [attr.role]="(isHandset$ | ngrxPush) ? 'dialog' : 'navigation'"
          [mode]="(isHandset$ | ngrxPush) ? 'over' : 'side'"
          [opened]="(isHandset$ | ngrxPush) === false"
        >
          <bd-workspace-explorer
            [connected]="(connected$ | ngrxPush) ?? false"
            [workspaceId]="(workspaceId$ | ngrxPush) ?? null"
          ></bd-workspace-explorer>
        </mat-sidenav>

        <mat-sidenav-content>
          <div class="flex flex-col h-screen">
            <div
              class="flex items-center gap-2 border-b-1 border-white border-opacity-10"
            >
              <bd-tab-list
                class="flex-grow"
                [tabs]="(tabs$ | ngrxPush) ?? null"
                [selectedTab]="(selectedTab$ | ngrxPush) ?? null"
                (closeTab)="onCloseTab($event)"
              ></bd-tab-list>

              <div class="px-4">
                <button type="button" mat-mini-fab (click)="settings.toggle()">
                  <mat-icon
                    aria-hidden="false"
                    aria-label="Bulldozer tool settings"
                    >settings</mat-icon
                  >
                </button>
              </div>
            </div>

            <div class="flex-grow">
              <router-outlet></router-outlet>
            </div>
          </div>
        </mat-sidenav-content>

        <mat-sidenav
          #settings
          class="bd-h-inherit w-80"
          fixedInViewport
          position="end"
          [mode]="'over'"
          [opened]="false"
        >
          <header class="px-7 py-8 border-b hd-border-gray">
            <h1 class="m-0 uppercase">Settings</h1>
          </header>

          <main class="flex flex-col">
            <section
              class="px-7 py-8 border-b hd-border-gray"
              *hdWalletAdapter="
                let wallet = wallet;
                let wallets = wallets;
                let publicKey = publicKey;
                let selectWallet = selectWallet
              "
            >
              <h2 class="m-0 hd-highlight-title uppercase">Wallet</h2>

              <ng-container *ngIf="publicKey !== null && wallet !== null">
                <p
                  class="flex items-center gap-2 px-2 bg-black bg-opacity-10 rounded-md"
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
                    mat-icon-button
                    [cdkCopyToClipboard]="publicKey.toBase58()"
                  >
                    <mat-icon>content_copy</mat-icon>
                  </button>
                </p>

                <div class="flex justify-between gap-2">
                  <button
                    class="flex-1"
                    mat-stroked-button
                    color="accent"
                    hdWalletModalButton
                    [wallets]="wallets"
                    (selectWallet)="selectWallet($event)"
                  >
                    Change wallet
                  </button>
                  <button
                    class="flex-1"
                    mat-stroked-button
                    color="warn"
                    hdWalletDisconnectButton
                  >
                    Disconnect
                  </button>
                </div>
              </ng-container>
            </section>

            <section
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
            </section>

            <section class="px-7 py-8 flex justify-between items-center">
              <p class="m-0 uppercase">Dark Mode</p>
              <bd-dark-theme-switch></bd-dark-theme-switch>
            </section>
          </main>
        </mat-sidenav>
      </mat-sidenav-container>

      <div class="block fixed bottom-0 right-0 w-screen z-20">
        <div class="flex justify-center">
          <bd-user-instructions-button
            class="mat-elevation-z8"
          ></bd-user-instructions-button>
        </div>
      </div>
    </div>
  `,
  providers: [
    TabStore,
    NotificationStore,
    ConfigStore,
    DarkThemeStore,
    UserStore,
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
    private readonly _hdSolanaApiService: HdSolanaApiService,
    private readonly _hdSolanaTransactionsStore: HdSolanaTransactionsStore,
    private readonly _hdSolanaConfigStore: HdSolanaConfigStore,
    private readonly _hdBroadcasterStore: HdBroadcasterStore,
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore
  ) {
    super();

    this._handleNetworkChanges(this._hdSolanaConfigStore.selectedNetwork$);
    this._redirectUnauthorized(this._walletStore.connected$);
    this._notificationStore.setError(this._walletStore.error$);
    this._subscribeToWorkspace(
      this._hdBroadcasterSocketStore.connected$.pipe(
        switchMap((connected) => {
          if (!connected) {
            return EMPTY;
          }

          return this._configStore.workspaceId$;
        })
      )
    );
    this._loadWalletTransactions(this._walletStore.publicKey$);
    this._loadWorkspaceTransactions(this._configStore.workspaceId$);
  }

  private readonly _loadWalletTransactions = this.effect<PublicKey | null>(
    switchMap((publicKey) => {
      this._hdSolanaTransactionsStore.clearTransactions();

      if (publicKey === null) {
        return EMPTY;
      }

      return this._hdSolanaApiService
        .getSignaturesForAddress(publicKey.toBase58(), undefined, 'confirmed')
        .pipe(
          tapResponse(
            (confirmedSignatureInfos) => {
              this._hdSolanaTransactionsStore.clearTransactions();
              confirmedSignatureInfos
                .filter(
                  (confirmedSignatureInfo) =>
                    confirmedSignatureInfo.confirmationStatus === 'confirmed'
                )
                .forEach((confirmedSignatureInfo) =>
                  this._hdSolanaTransactionsStore.reportProgress(
                    confirmedSignatureInfo.signature
                  )
                );
            },
            (error) => this._notificationStore.setError(error)
          )
        );
    })
  );

  private readonly _loadWorkspaceTransactions = this.effect<string | null>(
    switchMap((workspaceId) => {
      this._hdBroadcasterStore.clearTransactions();

      if (workspaceId === null) {
        return EMPTY;
      }

      return this._hdSolanaApiService
        .getSignaturesForAddress(workspaceId, undefined, 'confirmed')
        .pipe(
          tapResponse(
            (confirmedSignatureInfos) => {
              this._hdBroadcasterStore.clearTransactions();
              confirmedSignatureInfos
                .filter(
                  (confirmedSignatureInfo) =>
                    confirmedSignatureInfo.confirmationStatus === 'confirmed'
                )
                .forEach((confirmedSignatureInfo) =>
                  this._hdBroadcasterStore.handleTransactionConfirmed({
                    signature: confirmedSignatureInfo.signature,
                    topic: workspaceId,
                  })
                );
            },
            (error) => this._notificationStore.setError(error)
          )
        );
    })
  );

  private readonly _subscribeToWorkspace = this.effect<string | null>(
    pipe(
      startWith(null),
      pairwise(),
      tap(([previous, current]) => {
        if (previous !== null) {
          this._hdBroadcasterStore.unsubscribe(previous);
        }

        if (current !== null) {
          this._hdBroadcasterStore.subscribe(current);
        }
      })
    )
  );

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
