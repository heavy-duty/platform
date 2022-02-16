import { Component, Input } from '@angular/core';

@Component({
  selector: 'hd-connection-mini-status-button',
  template: `
    <div
      *ngIf="online && connected"
      class="bg-green-500 rounded-full w-4 h-4"
    ></div>

    <div *ngIf="!online" class="bg-red-500 rounded-full w-4 h-4"></div>

    <mat-progress-spinner
      *ngIf="online && !connected"
      diameter="16"
      mode="indeterminate"
    >
    </mat-progress-spinner>
  `,
})
export class HdConnectionMiniStatusComponent {
  @Input() online!: boolean;
  @Input() connected!: boolean;
}
