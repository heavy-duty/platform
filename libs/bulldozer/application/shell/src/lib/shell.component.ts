import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ApplicationStore,
  CollectionStore,
  InstructionStore,
  WorkspaceStore,
} from '@heavy-duty/bulldozer/application/data-access';

import { ApplicationShellStore } from './shell.store';

@Component({
  selector: 'bd-application-shell',
  template: `
    <bd-navigation (downloadCode)="onDownloadCode()">
      <nav mat-tab-nav-bar *ngIf="applicationId$ | ngrxPush as applicationId">
        <div
          mat-tab-link
          class="flex items-center justify-between p-0"
          *ngFor="let tab of tabs$ | ngrxPush"
          [active]="(selectedTab$ | ngrxPush) === tab.id"
        >
          <a [routerLink]="['/applications', applicationId, tab.kind, tab.id]">
            {{ tab.title }}
          </a>
          <button
            mat-icon-button
            (click)="onCloseTab($event, tab.id)"
            [attr.aria-label]="'Close ' + tab.title + ' tab'"
          >
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </nav>
      <router-outlet></router-outlet>
    </bd-navigation>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    WorkspaceStore,
    ApplicationStore,
    CollectionStore,
    InstructionStore,
    ApplicationShellStore,
  ],
})
export class ApplicationShellComponent {
  readonly applicationId$ = this._applicationStore.applicationId$;
  readonly tabs$ = this._applicationShellStore.tabs$;
  readonly selectedTab$ = this._applicationShellStore.selected$;

  constructor(
    private readonly _applicationShellStore: ApplicationShellStore,
    private readonly _applicationStore: ApplicationStore
  ) {}

  onDownloadCode() {
    this._applicationShellStore.downloadCode();
  }

  onCloseTab(event: Event, tabId: string) {
    event.stopPropagation();
    event.preventDefault();
    this._applicationShellStore.closeTab(tabId);
  }
}
