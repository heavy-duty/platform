import { Component, Input } from '@angular/core';
import { Network } from '@heavy-duty/ngx-solana';

@Component({
  selector: 'hd-connection-menu-button',
  template: `
    <button
      type="button"
      class="w-36"
      mat-raised-button
      [matTooltip]="selectedNetwork"
      matTooltipShowDelay="500"
    >
      <div class="flex justify-between items-center">
        <hd-connection-mini-status-button
          [online]="online"
          [connected]="connected"
        ></hd-connection-mini-status-button>

        <span
          class="flex-grow ml-2 uppercase overflow-hidden whitespace-nowrap overflow-ellipsis"
        >
          {{ selectedNetwork }}
        </span>
      </div>
    </button>
  `,
})
export class HdConnectionMenuButtonComponent {
  @Input() selectedNetwork!: Network;
  @Input() online!: boolean;
  @Input() connected!: boolean;
}
