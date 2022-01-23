import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[bdDarkTheme]',
})
export class DarkThemeDirective {
  @Input('bdDarkTheme') set darkThemeValue(value: boolean | null) {
    if (value !== null) {
      this.setDarkTheme(value);
    }
  }

  setDarkTheme(value: boolean) {
    const bodyClass = document.body.className;
    const isAlreadyInDarkMode = bodyClass.includes('darkMode');

    if (value) {
      if (isAlreadyInDarkMode) {
        return;
      }
      document.body.className += ' darkMode';
    } else {
      document.body.className = bodyClass.replace('darkMode', '');
    }
  }
}
