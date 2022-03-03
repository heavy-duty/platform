import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  ConfigStore,
  DarkThemeStore,
  TabStore,
} from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { UserStore } from '@bulldozer-client/users-data-access';
import { HdSolanaConfigStore } from '@heavy-duty/ngx-solana';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { distinctUntilChanged, filter, pairwise, pipe, tap } from 'rxjs';

@Component({
  selector: 'bd-shell',
  template: `
    <div>
      <mat-toolbar color="primary" class="shadow-xl sticky top-0 z-10">
        <div class="flex items-center">
          <figure class="flex justify-center">
            <img src="assets/images/logo.png" class="w-10" />
          </figure>
          <h2 class="text-center font-bold">BULLDOZER</h2>
        </div>
        <div class="ml-auto flex items-center">
          <bd-workspace-selector
            class="mr-6"
            [connected]="(connected$ | ngrxPush) ?? false"
            [workspaceIds]="(workspaceIds$ | ngrxPush) ?? null"
          ></bd-workspace-selector>

          <hd-wallet-multi-button
            class="bd-custom-color mr-6 h-auto leading-none"
            color="basic"
          ></hd-wallet-multi-button>

          <hd-connection-menu class="mr-6"></hd-connection-menu>

          <button
            mat-raised-button
            color="basic"
            [routerLink]="['/profile']"
            class="mr-6"
          >
            Profile
          </button>

          <bd-dark-theme-switch></bd-dark-theme-switch>
        </div>
      </mat-toolbar>
      <mat-sidenav-container class="bd-custom-height-layout w-full">
        <mat-sidenav
          #drawer
          class="bd-h-inherit bd-custom-top-toolbar w-52 pt-5"
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
          <bd-tab-list
            [tabs]="(tabs$ | ngrxPush) ?? null"
            [selectedTab]="(selectedTab$ | ngrxPush) ?? null"
            (closeTab)="onCloseTab($event)"
          ></bd-tab-list>

          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
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
  readonly workspaceIds$ = this._configStore.workspaceIds$;
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
