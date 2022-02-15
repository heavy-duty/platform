import { Component } from '@angular/core';

@Component({
  selector: 'ngx-connection-mini-status-button',
  template: `
    <ng-container
      *ngxSolanaConnection="let connected = connected; let online = online"
    >
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
    </ng-container>
  `,
})
export class NgxConnectionMiniStatusComponent {}
