import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

interface ViewModel {
  notificationOpen: boolean;
}

const initialState: ViewModel = {
  notificationOpen: false,
};

@Injectable()
export class ApplicationShellStore extends ComponentStore<ViewModel> {
  constructor(private readonly _matSnackBar: MatSnackBar) {
    super(initialState);
  }

  notifyErrors = this.effect((error$: Observable<unknown>) =>
    error$.pipe(
      tap(() => this.patchState({ notificationOpen: true })),
      switchMap((error) =>
        this._matSnackBar
          .open(
            error instanceof Error ? error.message : (error as string),
            'Close'
          )
          .afterDismissed()
          .pipe(tap(() => this.patchState({ notificationOpen: false })))
      )
    )
  );
}
