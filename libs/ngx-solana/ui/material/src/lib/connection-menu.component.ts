import { Component } from '@angular/core';
import {
  HttpEndpoint,
  Network,
  NgxSolanaConfigStore,
  NgxSolanaConnectionStore,
} from '@heavy-duty/ngx-solana';
import { WebSocketEndpoint } from '@heavy-duty/ngx-websocket';

@Component({
  selector: 'hd-connection-menu',
  template: `
    <button
      type="button"
      class="w-36"
      mat-raised-button
      *ngIf="selectedNetwork$ | async as selectedNetwork"
      [matMenuTriggerFor]="menu"
      [matTooltip]="selectedNetwork"
    >
      <div class="flex justify-between items-center">
        <div
          class="bg-green-500 rounded-full w-4 h-4"
          *ngIf="(online$ | async) && (connected$ | async)"
        ></div>

        <div
          class="bg-red-500 rounded-full w-4 h-4"
          *ngIf="(online$ | async) === false"
        ></div>

        <mat-progress-spinner
          diameter="16"
          mode="indeterminate"
          *ngIf="(online$ | async) && (connected$ | async) === false"
        >
        </mat-progress-spinner>

        <span
          class="flex-grow ml-2 uppercase overflow-hidden whitespace-nowrap overflow-ellipsis"
        >
          {{ selectedNetwork }}
        </span>
      </div>
    </button>

    <mat-menu #menu="matMenu">
      <div class="px-4 py-2 w-96" hdStopPropagation>
        <h2 class="m-0 uppercase">network</h2>

        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Choose a network</mat-label>
          <mat-select
            [ngModel]="selectedNetwork$ | async"
            (ngModelChange)="onSelectNetwork($event)"
          >
            <mat-option
              [value]="networkConfig.network"
              *ngFor="let networkConfig of networkConfigs$ | async"
            >
              {{ networkConfig.network }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <header class="flex items-baseline gap-2">
          <h2 class="m-0 uppercase">endpoints</h2>

          <button
            *ngIf="selectedNetworkConfig$ | async as selectedNetworkConfig"
            class="underline text-primary"
            hdEditEndpointsModalTrigger
            [apiEndpoint]="selectedNetworkConfig.apiEndpoint"
            [webSocketEndpoint]="selectedNetworkConfig.webSocketEndpoint"
            (editEndpoints)="
              onEditEndpoints(selectedNetworkConfig.network, $event)
            "
          >
            (change)
          </button>
        </header>

        <div
          class="bg-white bg-opacity-5 mat-elevation-z2 px-2 py-1 mb-4"
          *ngIf="selectedNetworkConfig$ | async as selectedNetworkConfig"
        >
          <div class="flex items-center m-0 text-sm text-opacity-50">
            <span class="font-bold mr-2">API:</span>
            <span
              class="font-thin flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden"
              [matTooltip]="selectedNetworkConfig.apiEndpoint"
            >
              {{ selectedNetworkConfig.apiEndpoint }}
            </span>
            <button
              mat-icon-button
              [cdkCopyToClipboard]="selectedNetworkConfig.apiEndpoint"
              aria-label="Copy API endpoint"
            >
              <mat-icon>content_copy</mat-icon>
            </button>
          </div>
          <div class="flex items-center m-0 text-sm text-opacity-50">
            <span class="font-bold mr-2">WebSocket: </span>
            <span
              class="font-thin flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden"
              [matTooltip]="selectedNetworkConfig.webSocketEndpoint"
            >
              {{ selectedNetworkConfig.webSocketEndpoint }}
            </span>
            <button
              mat-icon-button
              [cdkCopyToClipboard]="selectedNetworkConfig.apiEndpoint"
              aria-label="Copy API endpoint"
            >
              <mat-icon>content_copy</mat-icon>
            </button>
          </div>
        </div>

        <p class="m-0 text-xs">
          <ng-container *ngIf="online$ | async">
            <span class="text-green-500">Online</span> since
            <span class="text-primary">
              {{ onlineSince$ | async | date: 'short' }}
            </span>
          </ng-container>
          <ng-container *ngIf="(online$ | async) === false">
            <span class="text-red-500">Offline</span>

            since
            <span class="text-primary">
              {{ offlineSince$ | async | date: 'short' }}
            </span>
          </ng-container>
        </p>

        <p class="m-0 text-xs">
          <ng-container *ngIf="(online$ | async) && (connected$ | async)">
            <span class="text-green-500">Connected</span> since
            <span class="text-primary">
              {{ connectedAt$ | async | date: 'short' }}
            </span>
          </ng-container>
          <ng-container
            *ngIf="
              (online$ | async) &&
              (connected$ | async) === false &&
              (connecting$ | async) === false
            "
          >
            <ng-container
              *ngIf="
                nextAttemptAt$ | hdRelativeTime | async as nextAttemptAt;
                else reconnecting
              "
            >
              Reconnecting in

              <span class="text-primary">{{ nextAttemptAt }}</span
              >.
              <button (click)="onReconnect()" class="underline text-primary">
                (Reconnect now)
              </button>
            </ng-container>
            <ng-template #reconnecting> Reconnecting... </ng-template>
          </ng-container>
        </p>
      </div>
    </mat-menu>
  `,
})
export class HdConnectionMenuComponent {
  readonly online$ = this._connectionStore.online$;
  readonly onlineSince$ = this._connectionStore.onlineSince$;
  readonly offlineSince$ = this._connectionStore.offlineSince$;
  readonly connected$ = this._connectionStore.connected$;
  readonly connecting$ = this._connectionStore.connecting$;
  readonly connectedAt$ = this._connectionStore.connectedAt$;
  readonly nextAttemptAt$ = this._connectionStore.nextAttemptAt$;
  readonly networkConfigs$ = this._configStore.networkConfigs$;
  readonly selectedNetwork$ = this._configStore.selectedNetwork$;
  readonly selectedNetworkConfig$ = this._configStore.selectedNetworkConfig$;

  constructor(
    private readonly _connectionStore: NgxSolanaConnectionStore,
    private readonly _configStore: NgxSolanaConfigStore
  ) {}

  onReconnect() {
    this._connectionStore.reconnect();
  }

  onSelectNetwork(network: Network) {
    this._configStore.selectNetwork(network);
  }

  onEditEndpoints(
    network: Network,
    endpoints: {
      apiEndpoint: HttpEndpoint;
      webSocketEndpoint: WebSocketEndpoint;
    }
  ) {
    this._configStore.setNetworkConfig({
      network,
      ...endpoints,
    });
  }
}
