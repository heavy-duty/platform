import { Component, Inject } from '@angular/core';
import {
  NgxSolanaConfig,
  NgxSolanaConnectionStore,
  NGX_SOLANA_CONFIG,
} from '@heavy-duty/ngx-solana';

@Component({
  selector: 'hd-connection-menu',
  template: `
    <button type="button" mat-raised-button [matMenuTriggerFor]="menu">
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

        <p class="flex-grow my-0 ml-2 text-left uppercase">{{ network }}</p>
      </div>
    </button>

    <mat-menu #menu="matMenu" class="px-4 py-2">
      <h2 class="uppercase">{{ network }}</h2>

      <div class="bg-white bg-opacity-5 mat-elevation-z2 px-2 py-1 mb-4">
        <p class="m-0 text-sm text-opacity-50">
          <span class="font-bold">API: </span>
          <span class="font-thin">{{ apiEndpoint }}</span>
        </p>
        <p class="m-0 text-sm text-opacity-50">
          <span class="font-bold">WebSocket: </span>
          <span class="font-thin">{{ webSocketEndpoint }}</span>
        </p>
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
          *ngIf="(online$ | async) && (connected$ | async) === false"
        >
          Reconnecting in {{ nextAttemptAt$ | async }}
        </ng-container>
      </p>
    </mat-menu>
  `,
})
export class ConnectionMenuComponent {
  readonly online$ = this._connectionStore.online$;
  readonly onlineSince$ = this._connectionStore.onlineSince$;
  readonly offlineSince$ = this._connectionStore.offlineSince$;
  readonly connected$ = this._connectionStore.connected$;
  readonly connectedAt$ = this._connectionStore.connectedAt$;
  readonly nextAttemptAt$ = this._connectionStore.nextAttemptAt$;
  readonly network = this._solanaRpcConfig.network;
  readonly apiEndpoint = this._solanaRpcConfig.apiEndpoint;
  readonly webSocketEndpoint = this._solanaRpcConfig.webSocket.endpoint;

  constructor(
    @Inject(NGX_SOLANA_CONFIG)
    private readonly _solanaRpcConfig: NgxSolanaConfig,
    private readonly _connectionStore: NgxSolanaConnectionStore
  ) {}
}
