import { Component, OnInit } from '@angular/core';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer/data-access';
import { ProgramStore } from '@heavy-duty/ng-anchor';
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
  selector: 'bd-shell',
  template: ` <router-outlet></router-outlet> `,
  providers: [
    ProgramStore,
    BulldozerProgramStore,
    ConnectionStore,
    WalletStore,
  ],
})
export class ShellComponent implements OnInit {
  constructor(
    private readonly _connectionStore: ConnectionStore,
    private readonly _walletStore: WalletStore,
    private readonly _programStore: ProgramStore
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
    this._programStore.loadConnection(this._connectionStore.connection$);
    this._programStore.loadWallet(this._walletStore.anchorWallet$);
  }
}
