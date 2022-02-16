import { Component } from '@angular/core';

@Component({
  selector: 'hd-edpoints-list',
  template: `
    <header
      class="flex items-baseline gap-2"
      *hdSolanaConfig="
        let selectedNetworkConfig = selectedNetworkConfig;
        let editEndpoints = editEndpoints
      "
    >
      <h2 class="m-0 uppercase">endpoints</h2>

      <button
        *ngIf="selectedNetworkConfig"
        class="underline text-primary"
        hdEditEndpointsModalTrigger
        [apiEndpoint]="selectedNetworkConfig.apiEndpoint"
        [webSocketEndpoint]="selectedNetworkConfig.webSocketEndpoint"
        (editEndpoints)="editEndpoints(selectedNetworkConfig.network, $event)"
      >
        (change)
      </button>
    </header>

    <div
      class="bg-white bg-opacity-5 mat-elevation-z2 px-2 py-1 mb-4"
      *hdSolanaConfig="
        let apiEndpoint = apiEndpoint;
        let webSocketEndpoint = webSocketEndpoint
      "
    >
      <hd-edpoints-list-item
        label="API"
        [endpoint]="apiEndpoint"
      ></hd-edpoints-list-item>
      <hd-edpoints-list-item
        label="WebSocket"
        [endpoint]="webSocketEndpoint"
      ></hd-edpoints-list-item>
    </div>
  `,
})
export class HdEndpointsListComponent {}
