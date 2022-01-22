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
import { WalletModalComponent } from './modal.component';

@Directive({ selector: 'button[hdWalletModalButton]' })
export class WalletModalButtonDirective {
  @Input() wallets?: Wallet[] = [];
  @Input() featured = 3;
  @Output() selectWallet = new EventEmitter<WalletName>();
  @HostListener('click') onClick(): void {
    this._matDialog
      .open<
        WalletModalComponent,
        { wallets?: Wallet[]; featured: number },
        WalletName
      >(WalletModalComponent, {
        panelClass: 'wallet-modal',
        maxWidth: '380px',
        maxHeight: '90vh',
        data: {
          wallets: this.wallets,
          featured: this.featured,
        },
      })
      .afterClosed()
      .subscribe(
        (walletName) => walletName && this.selectWallet.emit(walletName)
      );
  }

  constructor(private readonly _matDialog: MatDialog) {}
}
