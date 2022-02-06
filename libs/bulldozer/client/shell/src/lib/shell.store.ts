import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  NotificationStore,
  TabStore,
} from '@heavy-duty/bulldozer/application/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rx-solana';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { Subject, switchMap, tap } from 'rxjs';

interface ViewModel {
  isHandset: boolean;
}

const initialState: ViewModel = {
  isHandset: false,
};

@Injectable()
export class ShellStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  readonly isHandset$ = this.select(({ isHandset }) => isHandset);
  readonly tabs$ = this._tabStore.tabs$;
  readonly selectedTab$ = this._tabStore.selected$;
  readonly connected$ = this._walletStore.connected$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _tabStore: TabStore,
    private readonly _matSnackBar: MatSnackBar,
    private readonly _breakpointObserver: BreakpointObserver,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);
  }

  readonly loadHandset = this.effect(() =>
    this._breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(tap((result) => this.patchState({ isHandset: result.matches })))
  );

  readonly notifyErrors = this.effect(() =>
    this._notificationStore.error$.pipe(
      isNotNullOrUndefined,
      switchMap((error) =>
        this._matSnackBar
          .open(error, 'Close', {
            panelClass: `error-snackbar`,
          })
          .afterDismissed()
          .pipe(tap(() => this._notificationStore.clearError()))
      )
    )
  );

  readonly notifyEvents = this.effect(() =>
    this._notificationStore.event$.pipe(
      isNotNullOrUndefined,
      switchMap((event) =>
        this._matSnackBar
          .open(event, 'Close', {
            panelClass: `success-snackbar`,
            duration: 3000,
          })
          .afterDismissed()
          .pipe(tap(() => this._notificationStore.clearEvent()))
      )
    )
  );

  closeTab(event: Event, tabId: string) {
    event.stopPropagation();
    event.preventDefault();
    // this._tabStore.closeTab(tabId);
  }
}
