import { Directive, HostListener } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';

@Directive({ selector: 'button[hdWalletDisconnectButton]' })
export class WalletDisconnectButtonDirective {
  @HostListener('click') onClick(): void {
    this._walletStore.disconnect().subscribe();
  }

  constructor(private readonly _walletStore: WalletStore) {}
}
