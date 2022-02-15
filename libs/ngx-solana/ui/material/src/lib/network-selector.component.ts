import { Component } from '@angular/core';

@Component({
  selector: 'ngx-network-selector',
  template: `
    <h2 class="m-0 uppercase">network</h2>

    <mat-form-field appearance="fill" class="w-full">
      <mat-label>Choose a network</mat-label>
      <mat-select
        *ngxSolanaConfig="
          let selectedNetwork = selectedNetwork;
          let networkConfigs = networkConfigs;
          let selectNetwork = selectNetwork
        "
        [value]="selectedNetwork"
        (selectionChange)="selectNetwork($event.value)"
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
export class NgxNetworkSelectorComponent {}
