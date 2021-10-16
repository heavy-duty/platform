import { Component, OnInit } from '@angular/core';
import { ConnectionStore, WalletStore } from '@danmt/wallet-adapter-angular';
import { ProgramStore } from '@heavy-duty/ng-anchor';

@Component({
  selector: 'bd-shell',
  template: ` <router-outlet></router-outlet> `,
})
export class ShellComponent implements OnInit {
  constructor(
    private readonly _connectionStore: ConnectionStore,
    private readonly _walletStore: WalletStore,
    private readonly _programStore: ProgramStore
  ) {}

  ngOnInit() {
    this._connectionStore.setEndpoint('http://localhost:8899');
    this._programStore.loadConnection(this._connectionStore.connection$);
    this._programStore.loadWallet(this._walletStore.anchorWallet$);
  }
}
