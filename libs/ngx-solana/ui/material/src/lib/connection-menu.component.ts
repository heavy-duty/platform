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

        <p class="flex-grow m-0 mx-2 text-left uppercase">{{ network }}</p>

        <mat-icon>arrow_drop_down</mat-icon>
      </div>
    </button>

    <mat-menu #menu="matMenu" class="px-4 py-2">
      <h2 class="uppercase">{{ network }}</h2>
      <p class="text-xs text-opacity-50">
        <span class="font-bold">API: </span>
        <span class="font-thin">{{ apiEndpoint }}</span>
      </p>
      <p class="text-xs text-opacity-50">
        <span class="font-bold">WebSocket: </span>
        <span class="font-thin">{{ webSocketEndpoint }}</span>
      </p>
    </mat-menu>
  `,
})
export class ConnectionMenuComponent {
  readonly online$ = this._connectionStore.online$;
  readonly connected$ = this._connectionStore.connected$;
  readonly network = this._solanaRpcConfig.network;
  readonly apiEndpoint = this._solanaRpcConfig.apiEndpoint;
  readonly webSocketEndpoint = this._solanaRpcConfig.webSocket.endpoint;

  constructor(
    @Inject(NGX_SOLANA_CONFIG)
    private readonly _solanaRpcConfig: NgxSolanaConfig,
    private readonly _connectionStore: NgxSolanaConnectionStore
  ) {}
}
