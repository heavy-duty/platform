import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Wallet } from '@heavy-duty/wallet-adapter';
import { WalletName } from '@solana/wallet-adapter-base';
import { HdWalletModalComponent } from './modal.component';

@Directive({ selector: 'button[hdWalletModalButton]' })
export class HdWalletModalButtonDirective {
  @Input() wallets?: Wallet[] = [];
  @Output() selectWallet = new EventEmitter<WalletName>();
  @HostListener('click') onClick(): void {
    this._matDialog
      .open<HdWalletModalComponent, { wallets: Wallet[] }, WalletName>(
        HdWalletModalComponent,
        {
          panelClass: ['wallet-modal', 'bd-bg-wood', 'bg-bd-brown'],
          maxWidth: '380px',
          maxHeight: '90vh',
          data: {
            wallets: this.wallets || [],
          },
        }
      )
      .afterClosed()
      .subscribe(
        (walletName) => walletName && this.selectWallet.emit(walletName)
      );
  }

  constructor(private readonly _matDialog: MatDialog) {}
}
