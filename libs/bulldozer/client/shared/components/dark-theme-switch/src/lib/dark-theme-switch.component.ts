import { Component } from '@angular/core';
import { DarkThemeService } from '@heavy-duty/bulldozer/application/utils/services/dark-theme';
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
  readonly isDarkThemeEnabled$ = this._themeService.isDarkThemeEnabled$;
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

  constructor(private readonly _themeService: DarkThemeService) {}

  toggleDarkMode() {
    this._themeService.toggleDarkTheme();
  }
}
