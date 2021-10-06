import { Component, OnInit } from '@angular/core';
import { ConnectionStore, WalletStore } from '@danmt/wallet-adapter-angular';
import { ProgramStore } from '@heavy-duty/bulldozer/data-access';

@Component({
  selector: 'bd-shell',
  template: ` <router-outlet></router-outlet> `,
  providers: [ProgramStore, ConnectionStore, WalletStore],
})
export class ShellComponent implements OnInit {
  constructor(private readonly _connectionStore: ConnectionStore) {}

  ngOnInit() {
    this._connectionStore.setEndpoint('http://localhost:8899');
  }
}
