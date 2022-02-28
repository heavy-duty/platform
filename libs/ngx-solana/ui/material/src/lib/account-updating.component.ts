import { Component, Input } from '@angular/core';

@Component({
  selector: 'hd-account-updating',
  template: `
    <mat-progress-spinner
      [diameter]="diameter"
      mode="indeterminate"
      [color]="color"
      *hdIsAccountUpdating="accountId"
    >
    </mat-progress-spinner>
  `,
})
export class HdAccountUpdatingComponent {
  @Input() accountId!: string;
  @Input() diameter = 16;
  @Input() color = 'primary';
}
