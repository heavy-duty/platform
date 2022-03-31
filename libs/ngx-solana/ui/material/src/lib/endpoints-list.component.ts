import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NetworkConfig } from '@heavy-duty/ngx-solana';

@Component({
  selector: 'hd-edpoints-list',
  template: `
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
