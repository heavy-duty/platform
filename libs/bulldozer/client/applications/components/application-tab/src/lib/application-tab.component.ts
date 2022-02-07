import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { ApplicationTabStore } from './application-tab.store';

@Component({
  selector: 'bd-application-tab',
  template: `
    <div
      *ngIf="application$ | ngrxPush as application"
      class="flex items-center justify-between p-0"
    >
      <a
        [routerLink]="[
          '/workspaces',
          application.data.workspace,
          'applications',
          application.id
        ]"
      >
        {{ application.name }}
      </a>
      <button
        mat-icon-button
        [attr.aria-label]="'Close ' + application.name + ' tab'"
        (click)="onCloseTab()"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  providers: [ApplicationTabStore],
})
export class ApplicationTabComponent {
  @HostBinding('class') class = 'block w-full';
  @Input() set applicationId(value: string | null) {
    this._applicationTabStore.setApplicationId(value);
  }
  @Output() closeTab = new EventEmitter();
  readonly application$ = this._applicationTabStore.application$;

  constructor(private readonly _applicationTabStore: ApplicationTabStore) {}

  onCloseTab() {
    this.closeTab.emit();
  }
}
