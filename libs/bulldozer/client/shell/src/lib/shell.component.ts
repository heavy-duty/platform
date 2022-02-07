import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ConfigStore } from '@bulldozer-client/config-store';
import { NotificationStore } from '@bulldozer-client/notification-store';
import { TabStore } from '@bulldozer-client/tab-store';
import { WalletStore } from '@heavy-duty/wallet-adapter';

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
  providers: [TabStore, NotificationStore, ConfigStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  readonly isHandset$ = this._configStore.isHandset$;
  readonly connected$ = this._walletStore.connected$;
  readonly workspaceId$ = this._configStore.workspaceId$;
  readonly tabs$ = this._tabStore.tabs$;
  readonly selectedTab$ = this._tabStore.selected$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _tabStore: TabStore,
    private readonly _configStore: ConfigStore
  ) {}

  onCloseTab(tabId: string) {
    this._tabStore.closeTab(tabId);
  }
}
