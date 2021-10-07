import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ApplicationStore,
  TabsStore,
} from '@heavy-duty/bulldozer/application/data-access';
import { CodeEditorSettingsService } from '@heavy-duty/bulldozer/application/utils/services/code-editor-settings';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'bd-view-application',
  template: `
    <nav mat-tab-nav-bar>
      <div class="flex justify-between w-full">
        <div class="flex items-center p-0">
          <div
            mat-tab-link
            class="flex items-center justify-between p-0"
            *ngFor="let tab of tabs$ | ngrxPush"
            [active]="(selectedTab$ | ngrxPush) === tab.id"
          >
            <a
              [routerLink]="[
                '/applications',
                tab.data.application,
                tab.kind,
                tab.id
              ]"
            >
              {{ tab.data.name }}
            </a>
            <button
              mat-icon-button
              (click)="onCloseTab($event, tab.id)"
              [attr.aria-label]="'Close ' + tab.data.name + ' tab'"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>
        <div
          class="flex items-center cursor-pointer"
          (click)="openCodeEditor()"
        >
          <mat-icon>code</mat-icon>
          <span class="pl-2 pr-4">View code</span>
        </div>
      </div>
    </nav>

    <router-outlet></router-outlet>
  `,
  providers: [TabsStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewApplicationComponent implements OnInit {
  readonly tabs$ = this._tabsStore.tabs$;
  readonly selectedTab$ = this._tabsStore.selected$;
  readonly applicationId$ = this._applicationStore.applicationId$;

  constructor(
    private readonly _applicationStore: ApplicationStore,
    private readonly _route: ActivatedRoute,
    private readonly _tabsStore: TabsStore,
    private readonly _codeEditorSettings: CodeEditorSettingsService
  ) {}

  ngOnInit() {
    this._applicationStore.selectApplication(
      this._route.paramMap.pipe(
        filter((paramMap) => paramMap.has('applicationId')),
        map((paramMap) => paramMap.get('applicationId') as string)
      )
    );
  }

  onCloseTab(event: Event, tabId: string) {
    event.stopPropagation();
    event.preventDefault();
    this._tabsStore.closeTab(tabId);
  }

  openCodeEditor() {
    this._codeEditorSettings.setCodeEditorVisibility(true);
  }
}
