import { Component } from '@angular/core';

@Component({
  selector: 'hd-connection-menu-button',
  template: `
    <ng-container *hdSolanaConfig="let selectedNetwork = selectedNetwork">
      <button
        *ngIf="selectedNetwork"
        type="button"
        class="w-36"
        mat-raised-button
        [matTooltip]="selectedNetwork"
      >
        <div class="flex justify-between items-center">
          <hd-connection-mini-status-button></hd-connection-mini-status-button>

          <span
            class="flex-grow ml-2 uppercase overflow-hidden whitespace-nowrap overflow-ellipsis"
          >
            {{ selectedNetwork }}
          </span>
        </div>
      </button>
    </ng-container>
  `,
})
export class HdConnectionMenuButtonComponent {}
