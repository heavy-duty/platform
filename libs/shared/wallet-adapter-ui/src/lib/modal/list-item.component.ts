import { Component, Input } from '@angular/core';
import { Wallet } from '@heavy-duty/wallet-adapter';
import { WalletReadyState } from '@solana/wallet-adapter-base';

@Component({
  selector: 'hd-wallet-list-item',
  template: `
    <div *ngIf="wallet" class="wallet-name">
      <hd-wallet-icon [wallet]="wallet"></hd-wallet-icon>
      <span>{{ wallet.adapter.name }}</span>
    </div>

    <span class="wallet-detected" *ngIf="isDetected()">Detected</span>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 1rem !important;
      }

      .wallet-name {
        display: flex;
        align-items: center;
      }

      .wallet-name span {
        margin-left: 1rem;
      }

      .wallet-detected {
        font-size: 0.8rem;
        opacity: 0.5;
      }
    `,
  ],
})
export class WalletListItemComponent {
  @Input() wallet: Wallet | null = null;

  isDetected() {
    return (
      this.wallet?.readyState &&
      this.wallet.readyState === WalletReadyState.Installed
    );
  }
}
