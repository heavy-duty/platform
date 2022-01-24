import { Component, OnInit } from '@angular/core';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolongWallet,
} from '@solana/wallet-adapter-wallets';

@Component({
  selector: 'bd-root',
  template: ` <router-outlet></router-outlet> `,
  styles: [],
})
export class AppComponent implements OnInit {
  constructor(
    private readonly _connectionStore: ConnectionStore,
    private readonly _walletStore: WalletStore
  ) {}

  ngOnInit() {
    this._connectionStore.setEndpoint('http://localhost:8899');
    this._walletStore.setWallets([
      getPhantomWallet(),
      getSolletWallet({ network: WalletAdapterNetwork.Devnet }),
      getSlopeWallet(),
      getSolflareWallet(),
      getSolongWallet(),
    ]);
  }
}
