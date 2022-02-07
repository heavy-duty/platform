import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isNotNullOrUndefined } from '@heavy-duty/rx-solana';
import { ComponentStore } from '@ngrx/component-store';
import { ProgramError } from '@project-serum/anchor';
import { WalletError } from '@solana/wallet-adapter-base';
import { switchMap, tap } from 'rxjs';

interface ViewModel {
  error: unknown | null;
  event: string | null;
}

const initialState: ViewModel = {
  error: null,
  event: null,
};

@Injectable()
export class ViewInstructionNotificationStore extends ComponentStore<ViewModel> {
  private readonly _event$ = this.select(({ event }) => event);
  private readonly _error$ = this.select(({ error }) => error);

  constructor(private readonly _matSnackBar: MatSnackBar) {
    super(initialState);
  }

  readonly setEvent = this.updater((state, event: string | null) => ({
    ...state,
    event,
  }));

  readonly setError = this.updater((state, error: unknown) => ({
    ...state,
    error,
  }));

  readonly notifyErrors = this.effect(() =>
    this._error$.pipe(
      isNotNullOrUndefined,
      switchMap((error) =>
        this._matSnackBar
          .open(this.getErrorMessage(error), 'Close', {
            panelClass: `error-snackbar`,
          })
          .afterDismissed()
      ),
      tap(() => this.setError(null))
    )
  );

  readonly notifyEvents = this.effect(() =>
    this._event$.pipe(
      isNotNullOrUndefined,
      switchMap((event) =>
        this._matSnackBar
          .open(event, 'Close', {
            panelClass: `success-snackbar`,
            duration: 2000,
          })
          .afterDismissed()
      ),
      tap(() => this.setEvent(null))
    )
  );

  private getErrorMessage(error: unknown) {
    if (typeof error === 'string') {
      return error;
    } else if (error instanceof WalletError) {
      return error.name;
    } else if (error instanceof ProgramError) {
      return error.message;
    } else {
      return 'Unknown error';
    }
  }
}
