import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Network, NetworkConfig } from '@heavy-duty/ngx-solana';

@Component({
  selector: 'hd-network-selector',
  template: `
    <mat-form-field appearance="fill" class="w-full">
      <mat-label>Choose a network</mat-label>
      <mat-select
        [value]="selectedNetwork"
        (selectionChange)="selectNetwork.emit($event.value)"
      >
        <mat-option
          [value]="networkConfig.network"
          *ngFor="let networkConfig of networkConfigs"
        >
          {{ networkConfig.network }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
})
export class HdNetworkSelectorComponent {
  @Input() selectedNetwork: Network | null = null;
  @Input() networkConfigs!: NetworkConfig[];
  @Output() selectNetwork = new EventEmitter<Network>();
}
