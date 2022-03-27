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
        <!-- -->
        <!-- -->
        <mat-sidenav-content>
          <mat-toolbar color="primary" class="shadow-md sticky top-0 z-10">
            <div class="ml-auto flex items-center">
              <button type="button" mat-mini-fab (click)="settings.toggle()">
                <mat-icon
                  aria-hidden="false"
                  aria-label="Bulldozer tool settings"
                  >settings</mat-icon
                >
              </button>
            </div>
          </mat-toolbar>
          <!-- -->
          <!-- -->
          <bd-tab-list
            [tabs]="(tabs$ | ngrxPush) ?? null"
            [selectedTab]="(selectedTab$ | ngrxPush) ?? null"
            (closeTab)="onCloseTab($event)"
          ></bd-tab-list>
          <!-- -->
          <!-- -->
          <router-outlet></router-outlet>
        </mat-sidenav-content>

        <!-- -->
        <!-- -->
        <mat-sidenav
          #settings
          class="bd-h-inherit w-72"
          fixedInViewport
          position="end"
          [mode]="'over'"
          [opened]="false"
        >
          <!-- Move to component -->
          <!-- -->
          <mat-toolbar color="accent" class="shadow-md sticky top-0 z-10">
            <div>
              <h2>SETTINGS</h2>
            </div>
          </mat-toolbar>
          <main class="flex flex-col">
            <section class="px-7 py-8 border-b hd-border-gray">
              <p>WALLET</p>
              <hd-wallet-multi-button
                class="bd-custom-color h-auto leading-none mr-6"
                color="basic"
              ></hd-wallet-multi-button>
            </section>

            <section class="px-7 py-8 border-b hd-border-gray">
              <p>NETWORK</p>
              <hd-connection-menu class="mr-6"></hd-connection-menu>
            </section>

            <section class="px-7 py-8 flex justify-between">
              <p class="m-0">DARK MODE</p>
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
