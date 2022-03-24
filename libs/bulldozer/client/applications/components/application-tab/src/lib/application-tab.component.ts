import { Component, HostBinding, Input } from '@angular/core';
import { ApplicationStore } from '@bulldozer-client/applications-data-access';
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
        class="w-40 flex justify-between gap-2 items-center pl-4 flex-grow"
        [matTooltip]="(tooltipMessage$ | ngrxPush) ?? ''"
      >
        <span
          class="flex-grow text-left overflow-hidden whitespace-nowrap overflow-ellipsis"
        >
          {{ application.name }}
        </span>
        <mat-progress-spinner
          class="flex-shrink-0"
          *ngIf="showSpinner$ | ngrxPush"
          mode="indeterminate"
          diameter="16"
        ></mat-progress-spinner>
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
  providers: [ApplicationStore, ApplicationTabStore],
})
export class ApplicationTabComponent {
  @HostBinding('class') class = 'block w-full';

  private _applicationId!: string;
  @Input() set applicationId(value: string) {
    this._applicationId = value;
    this._applicationStore.setApplicationId(this.applicationId);
  }
  get applicationId() {
    return this._applicationId;
  }

  readonly application$ = this._applicationStore.application$;
  readonly showSpinner$ = this._applicationTabStore.showSpinner$;
  readonly tooltipMessage$ = this._applicationTabStore.tooltipMessage$;

  constructor(
    private readonly _applicationTabStore: ApplicationTabStore,
    private readonly _applicationStore: ApplicationStore
  ) {}

  onCloseTab() {
    this._applicationTabStore.closeTab(this.applicationId);
  }
}
