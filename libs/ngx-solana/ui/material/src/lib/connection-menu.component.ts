import { Component, Inject } from '@angular/core';
import {
  NgxSolanaConfig,
  NgxSolanaConnectionStore,
  NGX_SOLANA_CONFIG,
} from '@heavy-duty/ngx-solana';

@Component({
  selector: 'hd-connection-menu',
  template: `
    <button mat-raised-button>
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
  `,
})
export class ConnectionMenuComponent {
  readonly online$ = this._connectionStore.online$;
  readonly connected$ = this._connectionStore.connected$;
  readonly network = this._solanaRpcConfig.network;
  readonly endpoint = this._solanaRpcConfig.apiEndpoint;

  constructor(
    @Inject(NGX_SOLANA_CONFIG)
    private readonly _solanaRpcConfig: NgxSolanaConfig,
    private readonly _connectionStore: NgxSolanaConnectionStore
  ) {}
}
