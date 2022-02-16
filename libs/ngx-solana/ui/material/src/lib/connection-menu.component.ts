import { Component } from '@angular/core';

@Component({
  selector: 'hd-connection-menu',
  template: `
    <hd-connection-menu-button
      [matMenuTriggerFor]="menu"
    ></hd-connection-menu-button>

    <mat-menu #menu="matMenu" class="connection-menu">
      <div class="w-96 p-4 flex flex-col gap-2" hdStopPropagation>
        <hd-network-selector></hd-network-selector>

        <hd-edpoints-list></hd-edpoints-list>

        <hd-connection-status></hd-connection-status>
      </div>
    </mat-menu>
  `,
})
export class HdConnectionMenuComponent {}
