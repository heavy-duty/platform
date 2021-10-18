import { Directive, Input } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
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
    if (value) {
      document.body.className += ' darkMode';
    } else {
      document.body.className = bodyClass.replace('darkMode', '');
    }
  }
}
