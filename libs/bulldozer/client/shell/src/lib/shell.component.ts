import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  NotificationStore,
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

        <nav mat-tab-nav-bar>
          <div
            mat-tab-link
            class="flex items-center justify-between p-0"
            *ngFor="let tab of tabs$ | ngrxPush"
            [active]="(selectedTab$ | ngrxPush) === tab.id"
          >
            <ng-container [ngSwitch]="tab.kind">
              <bd-application-tab
                *ngSwitchCase="'application'"
                [applicationId]="tab.id"
                (closeTab)="onCloseTab(tab.id)"
                bdStopPropagation
              ></bd-application-tab>
              <bd-collection-tab
                *ngSwitchCase="'collection'"
                [collectionId]="tab.id"
                (closeTab)="onCloseTab(tab.id)"
                bdStopPropagation
              ></bd-collection-tab>
            </ng-container>
          </div>
        </nav>

        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  providers: [ShellStore, TabStore, RouteStore, NotificationStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  readonly tabs$ = this._shellStore.tabs$;
  readonly selectedTab$ = this._shellStore.selectedTab$;
  readonly isHandset$ = this._shellStore.isHandset$;
  readonly connected$ = this._walletStore.connected$;
  readonly workspaceId$ = this._shellStore.workspaceId$;

  constructor(
    private readonly _shellStore: ShellStore,
    private readonly _walletStore: WalletStore
  ) {}

  onCloseTab(tabId: string) {
    this._shellStore.closeTab(tabId);
  }
}
