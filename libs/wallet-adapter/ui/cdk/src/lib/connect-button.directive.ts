import { Directive, HostListener } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';

@Directive({ selector: 'button[hdWalletConnectButton]', standalone: true })
export class HdWalletConnectButtonDirective {
	@HostListener('click') onClick(): void {
		this._walletStore.connect().subscribe();
	}

	constructor(private readonly _walletStore: WalletStore) {}
}
