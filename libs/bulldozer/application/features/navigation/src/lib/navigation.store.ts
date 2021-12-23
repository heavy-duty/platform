import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { tap } from 'rxjs/operators';

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

  constructor(
    private readonly _breakpointObserver: BreakpointObserver,
    private readonly _walletStore: WalletStore
  ) {
    super(initialState);
  }

  loadHandset = this.effect(() =>
    this._breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(tap((result) => this.patchState({ isHandset: result.matches })))
  );
}
