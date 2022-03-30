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
    <aside class="w-96 flex flex-col">
      <header class="py-5 px-7 border-b mb-0 w-full hd-border-gray">
        <h2 class="mb-0 text-xl uppercase">Profile</h2>
        <small class="leading-3">
          Visualize all the details about your profile and workspaces
        </small>
      </header>

      <ul>
        <li>
          <a
            class="flex flex-col gap-1 border-l-4 py-5 px-7"
            [routerLink]="['/profile', 'info']"
            [routerLinkActive]="['bg-white', 'bg-opacity-5', 'border-primary']"
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
            class="flex flex-col gap-1 border-l-4 py-5 px-7"
            [routerLink]="['/profile', 'workspaces']"
            [routerLinkActive]="['bg-white', 'bg-opacity-5', 'border-primary']"
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

    <div class="w-full bg-white bg-opacity-5">
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
