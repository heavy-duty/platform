import { Component } from '@angular/core';
import { DarkThemeService } from '@heavy-duty/bulldozer/application/ui/dark-theme';

@Component({
  selector: 'bd-dark-theme-switch',
  template: `
    <mat-icon class="mr-1">bedtime</mat-icon>
    <mat-slide-toggle
      class="mr-1"
      (change)="toggleDarkMode(!$event.checked)"
      [bdDarkTheme]="isDarkThemeEnabled$ | async"
      [checked]="(isDarkThemeEnabled$ | async) === false"
    >
    </mat-slide-toggle>
    <mat-icon>brightness_5</mat-icon>
  `,
  styles: [],
})
export class DarkThemeSwitchComponent {
  readonly isDarkThemeEnabled$ = this._themeService.isDarkThemeEnabled$;

  constructor(private readonly _themeService: DarkThemeService) {}

  toggleDarkMode(isDarkThemeEnabled: boolean) {
    this._themeService.setDarkTheme(isDarkThemeEnabled);
  }
}
