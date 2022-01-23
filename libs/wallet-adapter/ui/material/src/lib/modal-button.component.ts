import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  Input,
} from '@angular/core';
import { ButtonColor } from './types';

@Component({
  selector: 'hd-wallet-modal-button',
  template: `
    <button
      *hdWalletAdapter="let wallets = wallets; let selectWallet = selectWallet"
      mat-raised-button
      [color]="color"
      hdWalletModalButton
      [wallets]="wallets"
      (selectWallet)="selectWallet($event)"
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
export class HdWalletModalButtonComponent {
  @ContentChild('children') children: ElementRef | null = null;
  @Input() color: ButtonColor = 'primary';
}
