import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  RouteStore,
  TabStore,
} from '@heavy-duty/bulldozer/application/data-access';
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
        ></bd-workspace-explorer>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar color="primary" class="shadow-xl sticky top-0 z-10">
          <div class="ml-auto flex items-center">
            <bd-workspace-selector
              class="mr-6"
              [connected]="(connected$ | ngrxPush) ?? false"
              [workspaceId]="workspaceId$ | ngrxPush"
            ></bd-workspace-selector>

            <hd-wallet-multi-button
              class="bd-custom-color mr-6 h-auto leading-none"
              color="accent"
            ></hd-wallet-multi-button>

            <bd-dark-theme-switch></bd-dark-theme-switch>
          </div>
        </mat-toolbar>
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  providers: [ShellStore, TabStore, RouteStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  readonly tabs$ = this._shellStore.tabs$;
  readonly selectedTab$ = this._shellStore.selectedTab$;
  readonly isHandset$ = this._shellStore.isHandset$;
  readonly connected$ = this._walletStore.connected$;
  readonly workspaceId$ = this._routerStore.workspaceId$;

  constructor(
    private readonly _shellStore: ShellStore,
    private readonly _walletStore: WalletStore,
    private readonly _routerStore: RouteStore
  ) {}

  onCloseTab(event: Event, tabId: string) {
    this._shellStore.closeTab(event, tabId);
  }
}
