import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  RouteStore,
  TabStore,
} from '@heavy-duty/bulldozer/application/data-access';
import { ShellStore } from './shell.store';

@Component({
  selector: 'bd-shell',
  template: `
    <mat-sidenav-container fullscreen>
      <mat-sidenav
        #drawer
        class="w-64"
        fixedInViewport
        [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
        [mode]="(isHandset$ | async) ? 'over' : 'side'"
        [opened]="(isHandset$ | async) === false"
      >
        <bd-workspace-explorer></bd-workspace-explorer>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar color="primary" class="shadow-xl sticky top-0 z-10">
          <div class="ml-auto flex items-center">
            <bd-workspace-selector class="mr-6"></bd-workspace-selector>

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

  constructor(private readonly _shellStore: ShellStore) {}

  onCloseTab(event: Event, tabId: string) {
    this._shellStore.closeTab(event, tabId);
  }
}
