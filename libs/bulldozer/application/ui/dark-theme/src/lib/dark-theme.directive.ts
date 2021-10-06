import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[dbDarkTheme]',
})
export class DarkThemeDirective {
  @Input('dbDarkTheme') set darkThemeValue(value: boolean | null) {
    if (value !== null) {
      this.setDarkTheme(value);
    }
  }

  setDarkTheme(value: boolean) {
    const bodyClass = document.body.className;
    if (value) {
      document.body.className += ' darkMode';
    } else {
      document.body.className = bodyClass.replace('darkMode', '');
    }
  }
}
