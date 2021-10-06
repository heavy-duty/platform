import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { ConnectWalletComponent } from '@heavy-duty/bulldozer/features/connect-wallet';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ComponentStore } from '@ngrx/component-store';
import { of } from 'rxjs';
import {
  concatMap,
  exhaustMap,
  filter,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

interface ViewModel {
  isHandset: boolean;
}

const initialState: ViewModel = {
  isHandset: false,
};

@Injectable()
export class NavigationStore extends ComponentStore<ViewModel> {
  readonly isHandset$ = this.select(({ isHandset }) => isHandset);
  readonly connected$ = this._walletStore.connected$;
  readonly address$ = this.select(
    this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    (publicKey) => publicKey.toBase58()
  );
  readonly wallets$ = this._walletStore.wallets$;

  constructor(
    private readonly _breakpointObserver: BreakpointObserver,
    private readonly _matDialog: MatDialog,
    private readonly _walletStore: WalletStore
  ) {
    super(initialState);
  }

  loadHandset = this.effect(() =>
    this._breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(tap((result) => this.patchState({ isHandset: result.matches })))
  );

  connectWallet = this.effect((action$) =>
    action$.pipe(
      concatMap(() => of(null).pipe(withLatestFrom(this.wallets$))),
      exhaustMap(([, wallets]) =>
        this._matDialog
          .open(ConnectWalletComponent, { data: { wallets } })
          .afterClosed()
          .pipe(
            filter((data) => data),
            tap((walletName) => this._walletStore.selectWallet(walletName))
          )
      )
    )
  );

  disconnectWallet = this.effect((action$) =>
    action$.pipe(concatMap(() => this._walletStore.disconnect()))
  );

  onDisconnect() {
    if (confirm('Are you sure?')) {
      this._walletStore.disconnect().subscribe();
    }
  }
}
