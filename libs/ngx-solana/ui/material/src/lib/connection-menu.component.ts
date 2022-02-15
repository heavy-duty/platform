import { Component } from '@angular/core';

@Component({
  selector: 'ngx-connection-menu',
  template: `
    <ngx-connection-menu-button
      [matMenuTriggerFor]="menu"
    ></ngx-connection-menu-button>

    <mat-menu #menu="matMenu" class="connection-menu">
      <div class="w-96 p-4 flex flex-col gap-2" ngxStopPropagation>
        <ngx-network-selector></ngx-network-selector>

        <ngx-edpoints-list></ngx-edpoints-list>

        <ngx-connection-status></ngx-connection-status>
      </div>
    </mat-menu>
  `,
})
export class NgxConnectionMenuComponent {}
