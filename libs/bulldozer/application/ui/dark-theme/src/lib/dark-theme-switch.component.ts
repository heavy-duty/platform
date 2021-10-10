import { Component } from '@angular/core';
import { DarkThemeService } from '@heavy-duty/bulldozer/application/ui/dark-theme';
import { map } from 'rxjs/operators';

@Component({
  selector: 'bd-dark-theme-switch',
  template: `
    <button
      mat-mini-fab
      color="primary"
      aria-label="Dark theme switch"
      [bdDarkTheme]="isDarkThemeEnabled$ | async"
      (click)="toggleDarkMode()"
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
      isDarkThemeEnabled ? 'brightness_5' : 'bedtime'
    )
  );

  constructor(private readonly _themeService: DarkThemeService) {}

  toggleDarkMode() {
    this._themeService.toggleDarkTheme();
  }
}
