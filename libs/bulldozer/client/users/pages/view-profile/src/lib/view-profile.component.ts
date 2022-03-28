import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  WorkspaceQueryStore,
  WorkspacesStore,
} from '@bulldozer-client/workspaces-data-access';

@Component({
  selector: 'bd-view-profile',
  template: `
    <div class="flex flex-col">
      <mat-sidenav-container class="hd-view-profile-height">
        <mat-sidenav
          #userProfileInfo
          class="w-96"
          [mode]="'side'"
          [opened]="true"
        >
          <header class="py-5 px-7 border-b mb-0 w-full hd-border-gray">
            <h2 class="mb-0 ">PROFILE</h2>
            <small class="leading-3">
              Visualize all the details about your profile and workspaces
            </small>
          </header>

          <main class="flex flex-col">
            <mat-selection-list [multiple]="false">
              <mat-list-option
                [value]="'user-info'"
                [routerLink]="['/profile', 'user-info']"
                [selected]="isRouteActive('/profile/user-info')"
                [routerLinkActive]="'active'"
              >
                <div class="py-6 px-3">
                  <h2 class="mb-1">User Info</h2>
                  <small class="leading-3"> Visualize your user details </small>
                </div>
              </mat-list-option>
              <mat-list-option
                [value]="'workspaces'"
                [routerLink]="['/profile', 'workspaces']"
                [selected]="isRouteActive('/profile/workspaces')"
              >
                <div class="py-6 px-3">
                  <h2 class="mb-1">Workspaces</h2>
                  <small class="leading-3">
                    Visualize all your workspaces
                  </small>
                </div>
              </mat-list-option>
            </mat-selection-list>
          </main>
        </mat-sidenav>
        <mat-sidenav-content>
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  providers: [WorkspacesStore, WorkspaceQueryStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewProfileComponent {
  constructor(private readonly _router: Router) {}

  isRouteActive(url: string) {
    return this._router.isActive(url, {
      paths: 'exact',
      queryParams: 'exact',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }
}
