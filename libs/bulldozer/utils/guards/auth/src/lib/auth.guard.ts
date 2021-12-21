import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _router: Router
  ) {}

  canActivate() {
    return this._walletStore.connected$.pipe(
      map(
        (connected) =>
          connected || this._router.parseUrl('/unauthorized-access')
      )
    );
  }
}
