import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { isNotNullOrUndefined, LocalStorageSubject } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { tap } from 'rxjs';

interface ViewModel {
  isDarkThemeEnabled: boolean;
  error?: unknown;
}

@Injectable()
export class DarkThemeStore extends ComponentStore<ViewModel> {
  private readonly _darkTheme = new LocalStorageSubject<boolean>('darkTheme');
  readonly isDarkThemeEnabled$ = this._darkTheme.asObservable();

  constructor(private readonly _overlayContainer: OverlayContainer) {
    super({ isDarkThemeEnabled: false });

    try {
      this._darkTheme.next(localStorage.getItem('darkTheme') === 'true');
    } catch (error) {
      this.patchState({ error });
    }
  }

  protected readonly loadDarkThemeStatus = this.effect(() =>
    this._darkTheme.asObservable().pipe(
      isNotNullOrUndefined,
      tap((isDarkThemeEnabled) => {
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
      })
    )
  );

  toggleDarkTheme() {
    this._darkTheme.next(!this.get().isDarkThemeEnabled);
  }
}
