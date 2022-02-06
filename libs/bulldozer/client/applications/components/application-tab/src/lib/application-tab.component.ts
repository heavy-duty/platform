import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
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
export class ApplicationTabComponent implements OnInit {
  @HostBinding('class') class = 'block w-full';
  @Input() applicationId: string | null = null;
  @Output() closeTab = new EventEmitter();
  readonly application$ = this._applicationTabStore.application$;

  constructor(private readonly _applicationTabStore: ApplicationTabStore) {}

  ngOnInit() {
    if (this.applicationId === null) {
      throw new Error('ApplicationId is missing');
    }

    this._applicationTabStore.loadApplication$(this.applicationId);
  }

  onCloseTab() {
    this.closeTab.emit();
  }
}
