import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  ConfigStore,
  DarkThemeStore,
  NotificationStore,
  TabStore,
} from '@bulldozer-client/core-data-access';
import { NgxSolanaConnectionStore } from '@heavy-duty/ngx-solana';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ShellStore } from './shell.store';

@Component({
  selector: 'bd-shell',
  template: `
    <mat-sidenav-container fullscreen>
      <mat-sidenav
        #drawer
        class="w-64"
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
        <mat-toolbar color="primary" class="shadow-xl sticky top-0 z-10">
          <div class="ml-auto flex items-center">
            <bd-workspace-selector
              class="mr-6"
              [connected]="(connected$ | ngrxPush) ?? false"
            ></bd-workspace-selector>

            <hd-wallet-multi-button
              class="bd-custom-color mr-6 h-auto leading-none"
              color="accent"
            ></hd-wallet-multi-button>

            <hd-connection-menu class="mr-6"></hd-connection-menu>

            <bd-dark-theme-switch></bd-dark-theme-switch>
          </div>
        </mat-toolbar>

        <bd-tab-list
          [tabs]="(tabs$ | ngrxPush) ?? null"
          [selectedTab]="(selectedTab$ | ngrxPush) ?? null"
          (closeTab)="onCloseTab($event)"
        ></bd-tab-list>

        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  providers: [
    ShellStore,
    TabStore,
    NotificationStore,
    ConfigStore,
    DarkThemeStore,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent implements OnInit {
  readonly isHandset$ = this._configStore.isHandset$;
  readonly connected$ = this._walletStore.connected$;
  readonly workspaceId$ = this._configStore.workspaceId$;
  readonly tabs$ = this._tabStore.tabs$;
  readonly selectedTab$ = this._tabStore.selected$;
  readonly rpcConnected$ = this._ngxSolanaConnectionStore.connected$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _tabStore: TabStore,
    private readonly _configStore: ConfigStore,
    private readonly _shellStore: ShellStore,
    private readonly _ngxSolanaConnectionStore: NgxSolanaConnectionStore
  ) {}

  ngOnInit() {
    this._shellStore.redirectUnauthorized();
  }

  onCloseTab(tabId: string) {
    this._tabStore.closeTab(tabId);
  }
}
