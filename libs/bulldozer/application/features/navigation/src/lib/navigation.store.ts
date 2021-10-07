import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { ApplicationStore } from '@heavy-duty/bulldozer/application/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
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
  readonly applications$ = this.select(
    this._applicationStore.applications$,
    this._applicationStore.application$,
    (applications, application) =>
      applications.filter(({ id }) => id !== application?.id)
  );

  constructor(
    private readonly _breakpointObserver: BreakpointObserver,
    private readonly _walletStore: WalletStore,
    private readonly _applicationStore: ApplicationStore
  ) {
    super(initialState);
  }

  loadHandset = this.effect(() =>
    this._breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(tap((result) => this.patchState({ isHandset: result.matches })))
  );
}
