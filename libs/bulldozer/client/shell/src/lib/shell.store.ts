import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { concatMap, filter, tap } from 'rxjs';

@Injectable()
export class ShellStore extends ComponentStore<object> {
  constructor(
    private readonly _router: Router,
    private readonly _walletStore: WalletStore
  ) {
    super({});
  }

  readonly redirectUnauthorized = this.effect(($) =>
    $.pipe(
      concatMap(() =>
        this._walletStore.connected$.pipe(
          filter((connected) => !connected),
          tap(() =>
            this._router.navigate(['/unauthorized-access'], {
              queryParams: {
                redirect: this._router.routerState.snapshot.url,
              },
            })
          )
        )
      )
    )
  );
}
