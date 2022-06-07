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
		<aside class="w-80 flex flex-col flex-shrink-0 pt-5 pb-4 px-5 ml-2">
			<header class="mb-7 w-full">
				<p class="mb-0 text-2xl uppercase bp-font">Profile</p>
				<p class="text-xs mb-0">
					Visualize all the details about your profile and workspaces
				</p>
			</header>

			<ul class="flex-1 overflow-y-auto">
				<li>
					<a
						class="flex flex-col gap-1 py-3 px-7 bg-bp-stone-2 mb-6 mat-elevation-z4"
						[routerLink]="['/profile', 'info']"
						[routerLinkActive]="['bp-box-shadow-bg-white', 'border-primary']"
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
						class="flex flex-col gap-1 py-3 px-7 bg-bp-stone-2 mb-6 mat-elevation-z4"
						[routerLink]="['/profile', 'workspaces']"
						[routerLinkActive]="['bp-box-shadow-bg-white', 'border-primary']"
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

		<figure class="w-14 mt-2">
			<img src="assets/images/pipe.webp" width="56" height="1500" alt="pipe" />
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
