import { Component, OnInit } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
	PhantomWalletAdapter,
	SlopeWalletAdapter,
	SolflareWalletAdapter,
	SolletWalletAdapter,
	SolongWalletAdapter,
} from '@solana/wallet-adapter-wallets';

@Component({
	selector: 'bd-root',
	template: ` <router-outlet></router-outlet> `,
	styles: [],
})
export class AppComponent implements OnInit {
	constructor(private readonly _walletStore: WalletStore) {}

	ngOnInit() {
		this._walletStore.setAdapters([
			new PhantomWalletAdapter(),
			new SolletWalletAdapter({ network: WalletAdapterNetwork.Devnet }),
			new SlopeWalletAdapter(),
			new SolflareWalletAdapter(),
			new SolongWalletAdapter(),
		]);
	}
}
