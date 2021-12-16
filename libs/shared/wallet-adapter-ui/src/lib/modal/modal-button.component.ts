import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  Input,
} from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { WalletName } from '@solana/wallet-adapter-base';

import { ButtonColor } from '../shared/types';

@Component({
  selector: 'hd-wallet-modal-button',
  template: `
    <button
      mat-raised-button
      [color]="color"
      hdWalletModalButton
      [wallets]="wallets$ | ngrxPush"
      (selectWallet)="onSelectWallet($event)"
    >
      <ng-content></ng-content>
      <ng-container *ngIf="!children">Select Wallet</ng-container>
    </button>
  `,
  styles: [
    `
      button {
        display: inline-block;
      }

      .button-content {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletModalButtonComponent {
  @ContentChild('children') children: ElementRef | null = null;
  @Input() color: ButtonColor = 'primary';
  readonly wallets$ = this._walletStore.wallets$;

  constructor(private readonly _walletStore: WalletStore) {}

  onSelectWallet(walletName: WalletName): void {
    this._walletStore.selectWallet(walletName);
  }
}
