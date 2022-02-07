import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { filter, first, pairwise } from 'rxjs';
import { ApplicationTabStore } from './application-tab.store';

@Component({
  selector: 'bd-application-tab',
  template: `
    <div
      *ngIf="application$ | ngrxPush as application"
      class="flex items-stretch p-0"
    >
      <a
        [routerLink]="[
          '/workspaces',
          application.data.workspace,
          'applications',
          application.id
        ]"
        class="flex items-center pl-4 flex-grow"
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
  @Input() set applicationId(value: string | null) {
    this._applicationTabStore.setApplicationId(value);
  }
  @Output() closeTab = new EventEmitter();
  readonly application$ = this._applicationTabStore.application$;

  constructor(private readonly _applicationTabStore: ApplicationTabStore) {}

  ngOnInit() {
    this.application$
      .pipe(
        pairwise(),
        filter(([, application]) => application === null),
        first()
      )
      .subscribe(() => this.onCloseTab());
  }

  onCloseTab() {
    this.closeTab.emit();
  }
}
