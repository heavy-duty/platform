import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Tab } from '@bulldozer-client/tab-store';

@Component({
  selector: 'bd-tab-list',
  template: `
    <nav mat-tab-nav-bar>
      <div
        mat-tab-link
        class="flex items-center justify-between p-0"
        *ngFor="let tab of tabs"
        [active]="selectedTab === tab.id"
      >
        <ng-container [ngSwitch]="tab.kind">
          <bd-workspace-tab
            *ngSwitchCase="'workspace'"
            [workspaceId]="tab.id"
            (closeTab)="onCloseTab(tab.id)"
            bdStopPropagation
          ></bd-workspace-tab>
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
          <bd-instruction-tab
            *ngSwitchCase="'instruction'"
            [instructionId]="tab.id"
            (closeTab)="onCloseTab(tab.id)"
            bdStopPropagation
          ></bd-instruction-tab>
        </ng-container>
      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabListComponent {
  @Input() tabs: Tab[] | null = null;
  @Input() selectedTab: string | null = null;
  @Output() closeTab = new EventEmitter<string>();

  onCloseTab(tabId: string) {
    this.closeTab.emit(tabId);
  }
}
