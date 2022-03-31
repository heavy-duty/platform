import { Component, ViewChild } from '@angular/core';
import { MatMenu } from '@angular/material/menu';

@Component({
  selector: 'hd-connection-menu',
  template: `
    <ng-container *hdSolanaConfig="let selectedNetwork = selectedNetwork">
      <ng-container
        *hdSolanaConnection="let online = online; let connected = connected"
      >
        <hd-connection-menu-button
          *ngIf="selectedNetwork !== null"
          [matMenuTriggerFor]="menu"
          [selectedNetwork]="selectedNetwork"
          [online]="online"
          [connected]="connected"
        ></hd-connection-menu-button>
      </ng-container>
    </ng-container>

    <mat-menu #menu="matMenu" class="connection-menu">
      <div class="w-96 p-4 flex flex-col gap-2" hdStopPropagation>
        <ng-container
          *hdSolanaConfig="
            let selectedNetwork = selectedNetwork;
            let networkConfigs = networkConfigs;
            let selectNetwork = selectNetwork
          "
        >
          <h2 class="m-0 uppercase">network</h2>
          <hd-network-selector
            *ngIf="networkConfigs !== null"
            [selectedNetwork]="selectedNetwork"
            [networkConfigs]="networkConfigs"
            (selectNetwork)="selectNetwork($event)"
          ></hd-network-selector>
        </ng-container>

        <ng-container
          *hdSolanaConfig="
            let selectedNetworkConfig = selectedNetworkConfig;
            let editNetworkConfig = editNetworkConfig
          "
        >
          <header class="flex items-baseline gap-2">
            <h2 class="m-0 uppercase">endpoints</h2>

            <button
              *ngIf="selectedNetworkConfig !== null"
              class="underline text-primary"
              hdEditEndpointsModal
              [apiEndpoint]="selectedNetworkConfig.apiEndpoint"
              [webSocketEndpoint]="selectedNetworkConfig.webSocketEndpoint"
              (editEndpoints)="
                editNetworkConfig({
                  network: selectedNetworkConfig.network,
                  apiEndpoint: $event.apiEndpoint,
                  webSocketEndpoint: $event.webSocketEndpoint
                })
              "
              (click)="onCloseMenu()"
            >
              (change)
            </button>
          </header>

          <hd-edpoints-list
            *ngIf="selectedNetworkConfig !== null"
            [selectedNetworkConfig]="selectedNetworkConfig"
            (beforeEditNetworkConfig)="onCloseMenu()"
            (editNetworkConfig)="editNetworkConfig($event)"
          ></hd-edpoints-list>
        </ng-container>

        <hd-connection-status
          *hdSolanaConnection="
            let online = online;
            let connected = connected;
            let connecting = connecting;
            let onlineSince = onlineSince;
            let offlineSince = offlineSince;
            let connectedAt = connectedAt;
            let nextAttemptAt = nextAttemptAt;
            let reconnect = reconnect
          "
          [online]="online"
          [connected]="connected"
          [connecting]="connecting"
          [onlineSince]="onlineSince"
          [offlineSince]="offlineSince"
          [connectedAt]="connectedAt"
          [nextAttemptRelativeTime]="nextAttemptAt | hdRelativeTime | async"
          (reconnect)="reconnect()"
        >
        </hd-connection-status>
      </div>
    </mat-menu>
  `,
})
export class HdConnectionMenuComponent {
  @ViewChild(MatMenu) private _workspaceMenu?: MatMenu;

  onCloseMenu() {
    if (this._workspaceMenu) {
      this._workspaceMenu.closed.emit('click');
    }
  }
}
