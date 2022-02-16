import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { LocalStorageSubject } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { pipe, tap } from 'rxjs';

interface ViewModel {
  isDarkThemeEnabled: boolean;
  error?: unknown;
}

@Injectable()
export class DarkThemeStore extends ComponentStore<ViewModel> {
  private readonly _darkTheme = new LocalStorageSubject<boolean>('darkTheme');
  readonly isDarkThemeEnabled$ = this.select(
    ({ isDarkThemeEnabled }) => isDarkThemeEnabled
  );

  constructor(private readonly _overlayContainer: OverlayContainer) {
    super({ isDarkThemeEnabled: false });

    this._loadDarkThemeStatus(this._darkTheme.asObservable());
    this._persistDarkThemeStatus(this.isDarkThemeEnabled$);
  }

  private readonly _toggleDarkTheme = this.updater((state) => ({
    ...state,
    isDarkThemeEnabled: !state.isDarkThemeEnabled,
  }));

  private readonly _loadDarkThemeStatus = this.effect<boolean | null>(
    pipe(
      tap((isDarkThemeEnabled) => {
        if (isDarkThemeEnabled === null) {
          this._darkTheme.next(true);
        } else {
          this.patchState({ isDarkThemeEnabled });

          if (isDarkThemeEnabled) {
            this._overlayContainer
              .getContainerElement()
              .classList.add('darkMode');
          } else {
            this._overlayContainer
              .getContainerElement()
              .classList.remove('darkMode');
          }
        }
      })
    )
  );

  private readonly _persistDarkThemeStatus = this.effect<boolean>(
    tap(this._darkTheme)
  );

  toggleDarkTheme() {
    this._toggleDarkTheme();
  }
}
