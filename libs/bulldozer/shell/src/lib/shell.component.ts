import { Component, OnInit } from '@angular/core';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { ProgramStore } from '@heavy-duty/ng-anchor';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer/data-access';
import {
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolongWallet,
} from '@solana/wallet-adapter-wallets';
import { map } from 'rxjs/operators';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

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
    this._connectionStore.setNetwork('localnet' as WalletAdapterNetwork);
    this._walletStore.loadWallets(
      this._connectionStore.network$.pipe(
        map((network) => [
          getPhantomWallet(),
          getSolletWallet({ network }),
          getSlopeWallet(),
          getSolflareWallet(),
          getSolongWallet(),
        ])
      )
    );
    this._programStore.loadConnection(this._connectionStore.connection$);
    this._programStore.loadWallet(this._walletStore.anchorWallet$);
  }
}
