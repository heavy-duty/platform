import { Component, OnInit } from '@angular/core';
import { ConnectionStore } from '@danmt/wallet-adapter-angular';

@Component({
  selector: 'bd-shell',
  template: `
    <bd-navigation>
      <router-outlet></router-outlet>
    </bd-navigation>
  `,
})
export class ShellComponent implements OnInit {
  constructor(private readonly _connectionStore: ConnectionStore) {}

  ngOnInit() {
    this._connectionStore.setEndpoint('http://localhost:8899');
  }
}
