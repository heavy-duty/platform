import { Component, HostBinding } from '@angular/core';
import { TabStore } from '@bulldozer-client/core-data-access';

@Component({
  selector: 'bd-view-profile-tab',
  template: `
    <div class="flex items-center p-0">
      <a
        [routerLink]="['/profile']"
        class="w-40 h-10 flex items-center pl-4 flex-grow"
      >
        Profile
      </a>
      <button
        mat-icon-button
        aria-label="Close profile tab"
        (click)="onCloseTab()"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
})
export class ViewProfileTabComponent {
  @HostBinding('class') class = 'block w-full';

  constructor(private readonly _tabStore: TabStore) {}

  onCloseTab() {
    this._tabStore.closeTab('profile');
  }
}
