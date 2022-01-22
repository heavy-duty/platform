import { Component, Input } from '@angular/core';
import { Wallet } from '@heavy-duty/wallet-adapter';

@Component({
  selector: 'hd-wallet-icon',
  template: `
    <ng-container *ngIf="wallet">
      <img [src]="wallet.adapter.icon | sanitizeUrl" alt="" />
    </ng-container>
  `,
  styles: [
    `
      :host {
        width: 1.75rem;
        height: 1.75rem;
      }

      img {
        width: inherit;
        height: inherit;
      }
    `,
  ],
})
export class WalletIconComponent {
  @Input() wallet?: Wallet | null = null;
}
