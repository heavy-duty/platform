import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _router: Router
  ) {}

  canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this._walletStore.connected$.pipe(
      map((connected) => {
        if (connected) {
          return true;
        }

        const urlTree = this._router.parseUrl('/unauthorized-access');
        urlTree.queryParams = { redirect: state.url };
        return urlTree;
      })
    );
  }
}
