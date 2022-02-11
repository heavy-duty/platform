import { Component } from '@angular/core';
import { DarkThemeStore } from '@bulldozer-client/core-data-access';
import { map } from 'rxjs/operators';

@Component({
  selector: 'bd-dark-theme-switch',
  template: `
    <button
      color="accent"
      mat-mini-fab
      aria-label="Dark theme switch"
      [bdDarkTheme]="isDarkThemeEnabled$ | async"
      (click)="toggleDarkMode()"
      [ngStyle]="buttonDynamicStyle$ | async"
    >
      <mat-icon>{{ currentIconSelected$ | async }}</mat-icon>
    </button>
  `,
  styles: [],
})
export class DarkThemeSwitchComponent {
  readonly isDarkThemeEnabled$ = this._darkThemeStore.isDarkThemeEnabled$;
  readonly currentIconSelected$ = this.isDarkThemeEnabled$.pipe(
    map((isDarkThemeEnabled) =>
      isDarkThemeEnabled ? 'light_mode' : 'dark_mode'
    )
  );
  readonly buttonDynamicStyle$ = this.isDarkThemeEnabled$.pipe(
    map((isDarkThemeEnabled) =>
      isDarkThemeEnabled ? { color: 'white' } : { color: 'black' }
    )
  );

  constructor(private readonly _darkThemeStore: DarkThemeStore) {}

  toggleDarkMode() {
    this._darkThemeStore.toggleDarkTheme();
  }
}
