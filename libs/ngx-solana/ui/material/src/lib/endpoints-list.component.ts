import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NetworkConfig } from '@heavy-duty/ngx-solana';

@Component({
  selector: 'hd-edpoints-list',
  template: `
    <header class="flex items-baseline gap-2">
      <h2 class="m-0 uppercase">endpoints</h2>

      <button
        class="underline text-primary"
        hdEditEndpointsModal
        [apiEndpoint]="selectedNetworkConfig.apiEndpoint"
        [webSocketEndpoint]="selectedNetworkConfig.webSocketEndpoint"
        (editEndpoints)="
          editNetworkConfig.emit({
            network: selectedNetworkConfig.network,
            apiEndpoint: $event.apiEndpoint,
            webSocketEndpoint: $event.webSocketEndpoint
          })
        "
        (click)="beforeEditNetworkConfig.emit()"
      >
        (change)
      </button>
    </header>

    <div class="bg-white bg-opacity-5 mat-elevation-z2 px-2 py-1 mb-4">
      <hd-edpoints-list-item
        label="API"
        [endpoint]="selectedNetworkConfig.apiEndpoint"
      ></hd-edpoints-list-item>
      <hd-edpoints-list-item
        label="WebSocket"
        [endpoint]="selectedNetworkConfig.webSocketEndpoint"
      ></hd-edpoints-list-item>
    </div>
  `,
})
export class HdEndpointsListComponent {
  @Input() selectedNetworkConfig!: NetworkConfig;
  @Output() beforeEditNetworkConfig = new EventEmitter();
  @Output() editNetworkConfig = new EventEmitter<NetworkConfig>();
}
