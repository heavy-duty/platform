import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { TabStore } from '@bulldozer-client/core-data-access';

@Component({
  selector: 'bd-view-profile',
  template: `
    <aside class="w-80 flex flex-col flex-shrink-0">
      <header class="py-5 px-7 mb-0 w-full">
        <p class="mb-0 text-2xl uppercase bd-font">Profile</p>
        <p class="text-xs mb-0">
          Visualize all the details about your profile and workspaces
        </p>
      </header>

      <ul>
        <li>
          <a
            class="flex flex-col gap-1 py-3 px-7 bd-bg-image-13 w-72 m-auto mb-6 mat-elevation-z4"
            [routerLink]="['/profile', 'info']"
            [routerLinkActive]="['bd-box-shadow-bg-white', 'border-primary']"
            [ngClass]="{
              'border-transparent': !isRouteActive('/profile/info')
            }"
          >
            <span class="text-lg font-bold">User Info</span>
            <span class="text-xs font-thin"> Visualize your user details </span>
          </a>
        </li>
        <li>
          <a
            class="flex flex-col gap-1 py-3 px-7 bd-bg-image-13 w-72 m-auto mb-6 mat-elevation-z4"
            [routerLink]="['/profile', 'workspaces']"
            [routerLinkActive]="['bd-box-shadow-bg-white', 'border-primary']"
            [ngClass]="{
              'border-transparent': !isRouteActive('/profile/workspaces')
            }"
          >
            <span class="text-lg font-bold">Workspaces</span>
            <span class="text-xs font-thin">
              Visualize all your workspaces
            </span>
          </a>
        </li>
      </ul>
    </aside>

    <figure class="w-7 ml-6 mr-4">
      <img src="assets/images/pipe.png" />
    </figure>

    <div class="flex-1 overflow-y-auto">
      <router-outlet></router-outlet>
    </div>
  `,
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewProfileComponent implements OnInit {
  @HostBinding('class') class = 'flex h-full';

  constructor(
    private readonly _tabStore: TabStore,
    private readonly _router: Router
  ) {}

  ngOnInit() {
    this._tabStore.openTab({
      id: 'profile',
      kind: 'profile',
      url: '/profile',
    });
  }

  isRouteActive(url: string) {
    return this._router.isActive(url, {
      paths: 'exact',
      queryParams: 'exact',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }
}
